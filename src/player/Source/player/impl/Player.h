#pragma once 

#include <optional>
#include "IPlayer.h"
#include "IPlayerAudioProcessor.h"
#include "UniquePtrLockFreeQueue.h"
#include "AudioBuffer.h"
#include "IInstrumentFactory.h"
#include "SequenceTrack.h"
#include "ManagedAudioBuffer.h"

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
	virtual void setSequence(UniqueSequenceMap<std::shared_ptr<Event>> sequenceMap, SequenceTime endTime) override;

	// IPlayerAudioProcessor
	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override;
	virtual void processBlock(audio::AudioBuffer& buffer) override;
	virtual void processingEnded() override;
private:
	struct ProcessorMessage
	{
		UniqueSequenceMap<std::shared_ptr<Event>> newSequenceMap;
		std::optional<SequenceTime> newEndTime;
	};

	class Processor
	{
		static const size_t NUM_CHANNELS = 2;
		static const size_t QUEUE_SIZE = 128;
	public:
		Processor(std::shared_ptr<instrument::IInstrumentFactory> factory)
		:	m_queue(QUEUE_SIZE),
			m_sampleTimeMs(0)
		{
			m_managedBuffer.setChannels(NUM_CHANNELS);
			m_instruments[instrument::builtin::BASS] = factory->createInstrument(instrument::builtin::BASS);
			m_instruments[instrument::builtin::LEAD] = factory->createInstrument(instrument::builtin::LEAD);
		}

		void send(std::unique_ptr<ProcessorMessage> message);
		void prepareForProcessing(double sampleRate, size_t expectedBlockSize);
		void processBlock(audio::AudioBuffer& buffer);
		void processingEnded();
	private:

		UniquePtrLockFreeQueue<ProcessorMessage> m_queue;
		double m_sampleTimeMs;
		std::map <InstrumentID, std::unique_ptr<instrument::IInstrument>> m_instruments;
		instrument::SequenceTrack m_track;
		ManagedAudioBuffer m_managedBuffer;
	};

	Processor m_processor;
};



}