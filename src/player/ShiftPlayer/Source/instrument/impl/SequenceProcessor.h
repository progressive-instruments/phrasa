#pragma once

#include <memory>

#include "SequenceTrack.h"
#include "Event.h"
#include <optional>

using namespace std::literals::chrono_literals;

namespace shift::instrument::impl {

typedef std::multimap<SequenceTime,std::shared_ptr<Event>>::const_iterator EventMapIterator;


struct RelativeEvent {

	RelativeEvent(std::shared_ptr<Event> event, SequenceTime relativeTime)
		:event(event),
		relativeTime(relativeTime)
	{}
	SequenceTime relativeTime;
	std::shared_ptr<Event> event;

};

class EventHolder {
public:
	void advance(SequenceTime time)
	{
		m_prevTime = m_currentTime;
		if (m_pool.empty())
		{
			m_currentTime = std::chrono::microseconds(0);
		}
		else {
			m_currentTime += time;
		}
	}

	void addEvent(std::shared_ptr<Event> event, SequenceTime startOffsetTime = std::chrono::microseconds(0))
	{
		SequenceTime time = startOffsetTime + event->duration + m_currentTime;
		m_pool.insert({ time, event });
	}

	std::optional<RelativeEvent> getNextEvent(bool includeFutureEvents = false) {
		if (m_pool.begin() == m_pool.end() || 
			(!includeFutureEvents && 
				m_pool.begin()->first > m_currentTime)) {
			return std::nullopt;
		}

		auto res = RelativeEvent(m_pool.begin()->second, m_pool.begin()->first - m_prevTime);
		m_pool.erase(m_pool.begin());
		return res;
	}
	
private:
	SequenceTime m_prevTime;
	SequenceTime m_currentTime;
	std::multimap<SequenceTime, std::shared_ptr<Event>> m_pool;
};


/**
 * @brief Synchronous handling
*/
class SequenceProcessor
{
	
public:
	SequenceProcessor(bool addOffEvents = true) 
		:
		 m_sequence(new Sequence()),
		m_nextEventItr(m_sequence->events.cend())
	{}

	void setSequence(std::unique_ptr<Sequence>& sequence)
	{
		m_sequence = std::move(sequence);
		sequenceChanged = true;
	}

	void setSequenceTrack(const SequenceTrack& sequenceTrack) {
		
		if (sequenceChanged || sequenceTrack.Time != m_track.expectedNextTime())
		{
			m_nextEventItr = findNextEvent(sequenceTrack.Time);
			sequenceChanged = false;
		} else {
			while (getNextEvent().has_value()) 
			{}
		}
		m_track = sequenceTrack;
		m_currentTime = m_track.Time;
		m_durationLeft = m_track.Duration;
	}

	std::optional<RelativeEvent> getNextEvent()
	{
		if (m_track.SequenceLength == SequenceTime(0us)) {
			return std::nullopt;
		}
		while (m_nextEventItr == m_sequence->events.end()) {
			if (advanceToEndItr() == END_ITR_NOT_PASSED) {
				return std::nullopt;
			}
		}
		auto distanceFromCurrent = m_nextEventItr->first - m_currentTime;
		if (distanceFromCurrent >= m_durationLeft) {
			return std::nullopt;
		}
		m_durationLeft -= distanceFromCurrent;
		m_currentTime = m_nextEventItr->first;
		
		RelativeEvent res(m_nextEventItr->second, m_track.Duration - m_durationLeft);
		++m_nextEventItr;
		return res;
	}

private:

	EventMapIterator findNextEvent(SequenceTime time) {
		auto res = m_sequence->events.upper_bound(time);
		if (res == m_sequence->events.begin()) {
			return res;
		}
		else {
			--res;
			if (res->first == time) {
				return res;
			}
			else {
				return ++res;
			}
		}
	}

	enum AdvanceToEndItrRes { END_ITR_PASSED, END_ITR_NOT_PASSED };
	AdvanceToEndItrRes advanceToEndItr() {
		auto endTime = m_currentTime + m_durationLeft;
		if (endTime < m_track.SequenceLength) {
			return END_ITR_NOT_PASSED;
		}
		m_durationLeft = endTime - m_track.SequenceLength;
		m_nextEventItr = m_sequence->events.cbegin();
		m_currentTime = 0us;

		return END_ITR_PASSED;
	}

	std::unique_ptr<shift::Sequence> m_sequence;
	bool sequenceChanged;

	SequenceTrack m_track;
	EventMapIterator m_nextEventItr;
	SequenceTime m_currentTime;
	SequenceTime m_durationLeft;
};

}