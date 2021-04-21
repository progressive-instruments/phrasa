#include "Player.h"
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
	m_sineInstrument->prepareForProcessing(sampleRate, expectedBlockSize);
	m_sampleTimeMs = 1 / sampleRate * 1000;
}

inline void Player::Processor::processBlock(audio::AudioBuffer& buffer)
{
	std::unique_ptr<ProcessorMessage> msg;
	if (m_queue.pop(msg))
	{
		if (msg->newSequence != nullptr) {
			m_sineInstrument->setSequence(msg->newSequence);
		}
		if (msg->newEndTime.has_value()) {
			m_track.SequenceLength = *msg->newEndTime;
		}
	}
	
	if (m_track.SequenceLength == 0us) {
		return;
	}

	m_track.Advance(SequenceTime::FromMilliseconds(m_sampleTimeMs * buffer.numSamples));
	m_sineInstrument->processBlock(buffer, m_track);
}

inline void Player::Processor::processingEnded()
{
	m_sineInstrument->processingEnded();
}



void Player::setSequence(std::unique_ptr<Sequence> sequence, SequenceTime endTime)
{
	auto msg = std::make_unique<ProcessorMessage>();
	msg->newSequence = std::move(sequence);
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



