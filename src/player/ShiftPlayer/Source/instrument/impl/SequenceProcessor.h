#pragma once

#include <memory>

#include "SequenceTrack.h"
#include "Event.h"
#include <optional>

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

	bool hasEvents() {
		auto firstEventItr = m_pool.begin();
		return (firstEventItr != m_pool.end() &&
			firstEventItr->first <= m_currentTime);
	}

	RelativeEvent getNextEvent(bool includeFutureEvents = false) {
		if (m_pool.begin() == m_pool.end() || 
			(!includeFutureEvents && 
				m_pool.begin()->first > m_currentTime)) {
			throw std::runtime_error("no events");
		}
		return RelativeEvent(m_pool.begin()->second, m_pool.begin()->first - m_prevTime);
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
		m_addOffEvents(addOffEvents)
	{
		m_endItr = m_sequence->events.cend();
		m_currentItr = m_sequence->events.cend();
		m_endTime = SequenceTime(std::chrono::microseconds(0));
	}

	void setSequence(std::unique_ptr<Sequence>& sequence)
	{
		m_sequence = std::move(sequence);
		sequenceChanged = true;
	}

	void ring(EventMapIterator& itr) {
		if (m_sequence->events.cend() == itr) {
			itr = m_sequence->events.cbegin();
		}
	}


	void setSequenceTrack(const SequenceTrack& sequenceTrack) {
		m_sequenceTrack = sequenceTrack;
		m_currentRepeat = 0;
		if (sequenceChanged || sequenceTrack.Time != m_endTime)
		{
			// need to recalculate position
			m_currentItr = m_sequence->events.lower_bound(sequenceTrack.Time);
			ring(m_currentItr);
			sequenceChanged = false;
		}
		else
		{
			// continue with previous end
			m_currentItr = m_endItr;
		}

		m_repeats = !m_sequence->events.empty() ? sequenceTrack.Duration / sequenceTrack.SequenceLength : 0;
		m_endTime = (sequenceTrack.Time + sequenceTrack.Duration) % sequenceTrack.SequenceLength;

		if (sequenceTrack.Time <= m_endTime)
		{
			m_endItr = std::find_if(m_currentItr, m_sequence->events.cend(), [this](auto pair) {return pair.first >= m_endTime;});
		}
		else
		{
			m_endItr = std::find_if(m_sequence->events.cbegin(), m_currentItr, [this](auto pair) {return pair.first >= m_endTime;});
		}
		ring(m_endItr);
	}

	bool hasEvents() {
		return m_currentItr != m_endItr || m_currentRepeat < m_repeats;

	}


	RelativeEvent getNextEvent()
	{
		if (m_currentItr == m_endItr) {
			if (m_currentRepeat < m_repeats) {
				++m_currentRepeat;
			}
			else {
				throw std::runtime_error("no more elements");
			}
		}
		
		RelativeEvent res(m_currentItr->second, getRelativeTime(m_currentItr->first));
		++m_currentItr;
		ring(m_currentItr);

		return res;
	}

private:


	SequenceTime getRelativeTime(SequenceTime eventTime) {
		SequenceTime res;
		if (eventTime >= m_sequenceTrack.Time) {
			res = eventTime - m_sequenceTrack.Time;
		}
		else {
			res = m_sequenceTrack.SequenceLength - m_sequenceTrack.Time + eventTime;
		}
		res += m_sequenceTrack.Duration * m_repeats;
		return res;
	}

	std::unique_ptr<shift::Sequence> m_sequence;
	bool sequenceChanged;
	shift::SequenceTime m_endTime;

	EventMapIterator m_nextIterator;
	EventMapIterator m_currentItr;
	EventMapIterator m_endItr;
	SequenceTrack m_sequenceTrack;
	int m_repeats;
	int m_currentRepeat;
	bool m_addOffEvents;
};

}