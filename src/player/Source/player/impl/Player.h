#pragma once 

#include <optional>
#include "IPlayer.h"
#include "IPlayerAudioProcessor.h"
#include "UniquePtrLockFreeQueue.h"
#include "IInstrumentFactory.h"
#include <IInstrumentFactory.h>
#include <SequenceTrack.h>

namespace phrasa::player::impl {

class Player : public IPlayer, IPlayerAudioProcessor
{
	Player(const Player&) = delete;
	Player& operator=(const Player&) = delete;

public:
	Player(std::shared_ptr<instrument::IInstrumentFactory> instrumentFactory)
		: m_processor(instrumentFactory)
	{}

	// IPlayer
	virtual void setSequence(std::unique_ptr<Sequence> sequence, SequenceTime endTime) override;

	// IPlayerAudioProcessor
	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override;
	virtual void processBlock(audio::AudioBuffer& buffer) override;
	virtual void processingEnded() override;
private:
	struct ProcessorMessage
	{
		std::unique_ptr<Sequence> newSequence;
		std::optional<SequenceTime> newEndTime;
	};

	class Processor
	{
		const size_t QUEUE_SIZE = 128;

	public:
		Processor(std::shared_ptr<instrument::IInstrumentFactory> factory)
		:	m_factory(factory),
			m_queue(QUEUE_SIZE)
		{
			m_sineInstrument = m_factory->createInstrument(instrument::InstrumentType::SineSynth);
		}

		void send(std::unique_ptr<ProcessorMessage> message);
		void prepareForProcessing(double sampleRate, size_t expectedBlockSize);
		void processBlock(audio::AudioBuffer& buffer);
		void processingEnded();
	private:
		UniquePtrLockFreeQueue<ProcessorMessage> m_queue;
		double m_sampleTimeMs;
		std::shared_ptr<instrument::IInstrumentFactory> m_factory;

		std::unique_ptr<instrument::IInstrument> m_sineInstrument;
		instrument::SequenceTrack m_track;

	};

	Processor m_processor;
};



}