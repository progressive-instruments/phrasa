#include "Player.h"
#include "AudioBufferOperations.h"
using namespace phrasa::player::impl;
using namespace std::literals::chrono_literals;

inline void Player::Processor::run(Action& message)
{
	std::lock_guard guard(m_actionMutex);

	m_action = &message;
	m_newActionPending.store(true);
	std::this_thread::yield();
	while (m_newActionPending.load()) {
		std::this_thread::sleep_for(100ms);
	}
}

inline void Player::Processor::prepareForProcessing(double sampleRate, size_t expectedBlockSize)
{
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		itr->second->prepareForProcessing(sampleRate, expectedBlockSize);
	}
	m_sampleTimeMs = 1 / sampleRate * 1000;
	m_managedBuffer.setNumSamples(expectedBlockSize);
	m_sampleRate = sampleRate;
	m_expectedBlockSize = expectedBlockSize;
}


inline void Player::Processor::processBlock(audio::AudioBuffer& buffer)
{
	m_managedBuffer.setNumSamples(buffer.getNumSamples()); // ensure

	if(m_newActionPending.load())
	{
		m_action->run(*this);
		m_newActionPending.store(false);
	}
	
	if (m_track.SequenceLength == 0us || !m_isPlaying) {
		return;
	}
	m_track.Duration = SequenceTime::FromMilliseconds(m_sampleTimeMs * buffer.getNumSamples());
	audio::AudioBufferOperations::clear(buffer);
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		audio::AudioBufferOperations::clear(m_managedBuffer);
		itr->second->processBlock(m_managedBuffer, m_track);
		audio::AudioBufferOperations::add(m_managedBuffer, buffer);
	}
	audio::AudioBufferOperations::gain(buffer, 0.5);


	m_track.Advance();
}

inline void Player::Processor::processingEnded()
{
	for (auto itr = m_instruments.begin(); itr != m_instruments.end(); ++itr) {
		itr->second->processingEnded();
	}
}

void Player::updateAddedInstruments(const SequenceMap<std::shared_ptr<Event>>& sequence, std::vector<std::pair<InstrumentID, std::unique_ptr<instrument::IInstrument>>>& output) {
	for (auto instrumentEvent = sequence.begin(); instrumentEvent != sequence.end(); ++instrumentEvent) {
		if (m_activeInstruments.count(instrumentEvent->first) == 0) {
			try {
				auto instrument = m_instrumentFactory->createInstrument(instrumentEvent->first);
				output.push_back(std::make_pair(instrumentEvent->first, std::move(instrument)));
				m_activeInstruments.insert(instrumentEvent->first);
			}
			catch (std::exception& e) {
				// log instrument invalid
			}
		}
	}
}

// this will stay not used for now to make the build faster
void Player::updateRemovedInstruments(const SequenceMap<std::shared_ptr<Event>>& sequence, std::vector<InstrumentID>& output) {
	for (auto instrumentId : m_activeInstruments) {
		if (sequence.count(instrumentId) == 0) {
			output.push_back(instrumentId);
		}
	}
	for (auto removeInst : output) {
		m_activeInstruments.erase(removeInst);
	}
}

void Player::setSequence(UniqueSequenceMap<std::shared_ptr<Event>> sequenceMap, SequenceTime endTime)
{
	std::vector<InstrumentID> removedInstruments;
	std::vector<std::pair<InstrumentID, std::unique_ptr<instrument::IInstrument>>> addedInstruments;

	updateAddedInstruments(*sequenceMap, addedInstruments);
	updateRemovedInstruments(*sequenceMap, removedInstruments);

	Processor::SetSequenceAction action (std::move(sequenceMap), &addedInstruments, &removedInstruments, endTime);
	m_processor.run(action);
}

void phrasa::player::impl::Player::setPlayMode(PlayMode mode)
{
	Processor::SetPlayModeAction action(mode);
	m_processor.run(action);
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
	if (m_instrumentsToBeRemoved != nullptr) {
		for (auto inst : *m_instrumentsToBeRemoved) {
			processor.m_instruments[inst]->processingEnded();
			processor.m_instruments.erase(inst);
		}
	}
	if (m_newInstruments != nullptr) {
		for (auto& inst : *m_newInstruments) {
			inst.second->prepareForProcessing(processor.m_sampleRate, processor.m_expectedBlockSize);
			processor.m_instruments[inst.first] = std::move(inst.second);
		}
	}
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
