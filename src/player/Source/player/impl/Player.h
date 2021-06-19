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
	virtual void setPlayMode(PlayMode mode) override;

	// IPlayerAudioProcessor
	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override;
	virtual void processBlock(audio::AudioBuffer& buffer) override;
	virtual void processingEnded() override;
private:

	class Processor
	{
		static const size_t NUM_CHANNELS = 2;
		static const size_t QUEUE_SIZE = 128;
	public:
		Processor(std::shared_ptr<instrument::IInstrumentFactory> factory)
		:	m_queue(QUEUE_SIZE),
			m_sampleTimeMs(0),
			m_isPlaying(true)
		{
			m_managedBuffer.setChannels(NUM_CHANNELS);
			m_instruments[instrument::builtin::BASS] = factory->createInstrument(instrument::builtin::BASS);
			m_instruments[instrument::builtin::LEAD] = factory->createInstrument(instrument::builtin::LEAD);
		}

		class Action {
		public:
			virtual ~Action() {};
			virtual void run(Processor& processor) = 0;
		};

		void send(std::unique_ptr<Action> action);
		void prepareForProcessing(double sampleRate, size_t expectedBlockSize);
		void processBlock(audio::AudioBuffer& buffer);
		void processingEnded();

		class SetSequenceAction: public Action {
		public:
			
			SetSequenceAction(
				UniqueSequenceMap<std::shared_ptr<Event>> newSequenceMap,
				std::optional<SequenceTime> newEndTime = std::nullopt)
				: m_newSequenceMap(std::move(newSequenceMap)),
					m_newEndTime(newEndTime){}

			void run(Processor& processor)override;
		private:
			UniqueSequenceMap<std::shared_ptr<Event>> m_newSequenceMap;
			std::optional<SequenceTime> m_newEndTime;
		};

		class SetPlayModeAction : public Action {
		public:

			SetPlayModeAction(
				PlayMode mode)
				: m_mode(mode) {}

			void run(Processor& processor)override;
		private:
			PlayMode m_mode;
		};


	private:

		UniquePtrLockFreeQueue<Action> m_queue;
		double m_sampleTimeMs;
		std::map <InstrumentID, std::unique_ptr<instrument::IInstrument>> m_instruments;
		instrument::SequenceTrack m_track;
		ManagedAudioBuffer m_managedBuffer;
		bool m_isPlaying;
	};

	Processor m_processor;
};



}