#include "Player.h"
#include "AudioBufferOperations.h"
using namespace phrasa::player::impl;
using namespace std::literals::chrono_literals;

inline void Player::Processor::send(std::unique_ptr<ProcessorMessage> message)
{
	if (!m_queue.push(message))
	{
		throw new std::runtime_error("failed to push sequence to queue");
	}
}

inline void Player::Processor::prepareForProcessing(double sampleRate, size_t expectedBlockSize)
{
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		itr->second->prepareForProcessing(sampleRate, expectedBlockSize);
	}
	m_sampleTimeMs = 1 / sampleRate * 1000;
	m_managedBuffer.setNumSamples(expectedBlockSize);
}


inline void Player::Processor::processBlock(audio::AudioBuffer& buffer)
{
	m_managedBuffer.setNumSamples(buffer.getNumSamples()); // ensure

	std::unique_ptr<ProcessorMessage> msg;
	if (m_queue.pop(msg))
	{
		if (msg->newSequenceMap != nullptr) {
			for (auto itr = msg->newSequenceMap->begin(); itr != msg->newSequenceMap->end(); ++itr) {
				if (m_instruments.count(itr->first) > 0) {
					m_instruments[itr->first]->setSequence(itr->second);
				}
				else {
					// instrument does not exist
				}
			}
		}
		if (msg->newEndTime.has_value()) {
			m_track.SequenceLength = *msg->newEndTime;
		}
	}
	
	if (m_track.SequenceLength == 0us) {
		return;
	}
	m_track.Advance(SequenceTime::FromMilliseconds(m_sampleTimeMs * buffer.getNumSamples()));
	AudioBufferOperations::clear(buffer);
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		AudioBufferOperations::clear(m_managedBuffer);
		itr->second->processBlock(m_managedBuffer, m_track);
		AudioBufferOperations::add(m_managedBuffer, buffer);
	}
	AudioBufferOperations::gain(buffer, 0.4);
}

inline void Player::Processor::processingEnded()
{
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		itr->second->processingEnded();
	}
}



void Player::setSequence(UniqueSequenceMap<std::shared_ptr<Event>> sequenceMap, SequenceTime endTime)
{
	auto msg = std::make_unique<ProcessorMessage>();
	msg->newSequenceMap = std::move(sequenceMap);
	msg->newEndTime = endTime;
	m_processor.send(std::move(msg));
}


void Player::prepareForProcessing(double sampleRate, size_t expectedBlockSize)
{
	m_processor.prepareForProcessing(sampleRate, expectedBlockSize);
}

void Player::processBlock(audio::AudioBuffer& buffer)
{
	m_processor.processBlock(buffer);
}

void Player::processingEnded()
{
	m_processor.processingEnded();
}



