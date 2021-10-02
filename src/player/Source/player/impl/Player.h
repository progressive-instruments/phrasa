#pragma once 

#include <optional>
#include <mutex>
#include <atomic>
#include <set>
#include "IPlayer.h"
#include "IPlayerAudioProcessor.h"
#include "AudioBuffer.h"
#include "IInstrumentFactory.h"
#include "SequenceTrack.h"
#include "ManagedAudioBuffer.h"
#include "UniquePtrLockFreeQueue.h"

namespace phrasa::player::impl {



class Player : public IPlayer, IPlayerAudioProcessor
{
	Player(const Player&) = delete;
	Player& operator=(const Player&) = delete;

public:

	Player(std::shared_ptr<instrument::IInstrumentFactory> instrumentFactory)
		: m_instrumentFactory(instrumentFactory)
	{}

	// IPlayer
	virtual void setSequence(UniqueSequenceMap<std::shared_ptr<Event>> sequenceMap, SequenceTime endTime) override;
	virtual void setPlayMode(PlayMode mode) override;
	virtual void setSequencePosition(double sequencePosition) override;
	virtual void getState(PlayerState& state) override;

	// IPlayerAudioProcessor
	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize) override;
	virtual void processBlock(audio::AudioBuffer& buffer) override;
	virtual void processingEnded() override;
private:

	void updateAddedInstruments(const SequenceMap<std::shared_ptr<Event>>& sequence, std::vector<std::pair<InstrumentID, std::unique_ptr<instrument::IInstrument>>>& output);

	void updateRemovedInstruments(const SequenceMap<std::shared_ptr<Event>>& sequence, std::vector<InstrumentID>& output);

	class Processor
	{
		static const size_t NUM_CHANNELS = 2;
	public:
		Processor()
		:	m_newActionPending(false),
			m_action(nullptr),
			m_sampleTimeMs(0),
			m_isPlaying(false),
			m_instrumentThrash(128)
		{
			m_managedBuffer.setChannels(NUM_CHANNELS);
		}

		void cleanUnusedResources();
		void prepareForProcessing(double sampleRate, size_t expectedBlockSize);
		void processBlock(audio::AudioBuffer& buffer);
		void processingEnded();

		class Action {
		public:
			virtual ~Action() {};
			virtual void run(Processor& processor) = 0;
		};

		void run(Action& action);
		void getState(PlayerState& state);

		class SetSequenceAction: public Action {
		public:
			
			SetSequenceAction(
				UniqueSequenceMap<std::shared_ptr<Event>> newSequenceMap,
				std::vector<std::pair<InstrumentID, std::unique_ptr<instrument::IInstrument>>>* newInstruments = nullptr,
				std::vector<InstrumentID>* instrumentsToBeRemoved = nullptr,
				std::optional<SequenceTime> newEndTime = std::nullopt)
				: m_newSequenceMap(std::move(newSequenceMap)),
					m_instrumentsToBeRemoved(instrumentsToBeRemoved),
					m_newInstruments(newInstruments),
					m_newEndTime(newEndTime)
			{}

			void run(Processor& processor)override;
		private:
			std::vector<std::pair<InstrumentID, std::unique_ptr<instrument::IInstrument>>>* m_newInstruments;
			std::vector<InstrumentID>* m_instrumentsToBeRemoved;
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

		class SetSequencePositionAction : public Action {
		public:

			SetSequencePositionAction(
				double newPosition)
				: m_newPosition(newPosition) {}

			void run(Processor& processor)override;
		private:
			double m_newPosition;
		};


	private:
		void tryUpdateState();

		std::mutex m_actionMutex;
		std::atomic<bool> m_newActionPending;
		Action* m_action;
		
		double m_sampleTimeMs;
		std::map <InstrumentID, std::unique_ptr<instrument::IInstrument>> m_instruments;
		instrument::SequenceTrack m_track;
		ManagedAudioBuffer m_managedBuffer;
		bool m_isPlaying;
		double m_sampleRate;
		size_t m_expectedBlockSize;
		PlayerState m_state;
		std::atomic<bool> m_playerStateLock;
		UniquePtrLockFreeQueue<instrument::IInstrument> m_instrumentThrash;
	};

	Processor m_processor;
	std::shared_ptr<instrument::IInstrumentFactory> m_instrumentFactory;
	std::set<InstrumentID> m_activeInstruments;
};



}