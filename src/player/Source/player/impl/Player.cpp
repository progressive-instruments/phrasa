#include "Player.h"
#include "AudioBufferOperations.h"
using namespace phrasa::player::impl;
using namespace std::literals::chrono_literals;

inline void Player::Processor::send(std::unique_ptr<Action> message)
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

	std::unique_ptr<Action> action;
	while (m_queue.pop(action))
	{
		action->run(*this);
	}
	
	if (m_track.SequenceLength == 0us || !m_isPlaying) {
		return;
	}
	m_track.Duration = SequenceTime::FromMilliseconds(m_sampleTimeMs * buffer.getNumSamples());
	AudioBufferOperations::clear(buffer);
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		AudioBufferOperations::clear(m_managedBuffer);
		itr->second->processBlock(m_managedBuffer, m_track);
		AudioBufferOperations::add(m_managedBuffer, buffer);
	}
	AudioBufferOperations::gain(buffer, 0.4);

	m_track.Advance();
}

inline void Player::Processor::processingEnded()
{
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		itr->second->processingEnded();
	}
}



void Player::setSequence(UniqueSequenceMap<std::shared_ptr<Event>> sequenceMap, SequenceTime endTime)
{
	std::unique_ptr<Processor::Action> msg (new Processor::SetSequenceAction(std::move(sequenceMap), endTime));
	m_processor.send(std::move(msg));
}

void phrasa::player::impl::Player::setPlayMode(PlayMode mode)
{
	m_processor.send(std::unique_ptr<Processor::Action>(
		new Processor::SetPlayModeAction(mode)));
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

void Player::Processor::SetSequenceAction::run(Processor& processor)
{
	if (m_newSequenceMap != nullptr) {
		for (auto itr = processor.m_instruments.begin(); itr != processor.m_instruments.end(); ++itr) {
			if (m_newSequenceMap->count(itr->first) > 0) {
				itr->second->setSequence((*m_newSequenceMap)[itr->first]);
			}
			else {
				itr->second->clearSequence();
			}
		}
	}
	if (m_newEndTime.has_value()) {
		processor.m_track.SequenceLength = *m_newEndTime;
	}
}

void Player::Processor::SetPlayModeAction::run(Processor& processor)
{
	switch (m_mode) {
	case PlayMode::Stop:
		processor.m_track.Time = SequenceTime::FromMilliseconds(0);
		processor.m_isPlaying = false;
		break;
	case PlayMode::Pause:
		processor.m_isPlaying = false;
		break;
	case PlayMode::Play:
		processor.m_isPlaying = true;
		break;
	}
	
}
