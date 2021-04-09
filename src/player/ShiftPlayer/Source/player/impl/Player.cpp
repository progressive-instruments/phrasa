#include "Player.h"
using namespace shift::player::impl;


inline void Player::Processor::send(std::unique_ptr<ProcessorMessage> message)
{
	if (!m_queue.push(message))
	{
		throw new std::runtime_error("failed to push sequence to queue");
	}
}

inline void Player::Processor::prepareForProcessing(unsigned int sampleRate, size_t expectedBlockSize)
{
	m_sampleTimeMs = 1.0 / sampleRate / 1000;
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
	
	m_track.Time = (m_track.Time + m_track.Duration) % m_track.SequenceLength;
	m_track.Duration = SequenceTime::FromMilliseconds(m_sampleTimeMs * buffer.bufferSize);
	m_sineInstrument->processBlock(buffer, m_track);
}

inline void Player::Processor::processingEnded()
{
}



void Player::setSequence(std::unique_ptr<Sequence> sequence, SequenceTime endTime)
{
	auto msg = std::make_unique<ProcessorMessage>();
	msg->newSequence = std::move(sequence);
	msg->newEndTime = endTime;
	m_processor.send(std::move(msg));
}


void Player::prepareForProcessing(unsigned int sampleRate, size_t expectedBlockSize)
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



