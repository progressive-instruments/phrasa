#pragma once

#include "Event.h"
#include "SequenceTrack.h"
#include "Sequence.h"
#include <optional>

using namespace std::literals::chrono_literals;

namespace phrasa::instrument::impl {

template <typename T>
using EventMapIterator = typename std::multimap<SequenceTime,T>::const_iterator;

template<class T>
struct RelativeEvent {

	RelativeEvent(T event, SequenceTime relativeTime)
		:event(event),
		relativeTime(relativeTime)
	{}
	SequenceTime relativeTime;
	T event;
};

template<class T>
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

	void addEvent(T event, SequenceTime startOffsetTime = std::chrono::microseconds(0))
	{
		SequenceTime time = startOffsetTime + m_currentTime;
		m_pool.insert({ time, event });
	}

	/**
	 * @brief Consume all left events in current time frame.
	 * @tparam Consumer
	 * @param consumer
	*/
	template<class Consumer>
	void consume(Consumer consumer) {
		auto event = getNextEvent();
		while (event.has_value()) {
			consumer((RelativeEvent<T>&)event.value());
			event = getNextEvent();
		}
	}

	/**
	 * @brief Set new time and consume all new events.
	 * @tparam Consumer
	 * @param consumer
	 * @param sequenceTrack
	*/
	template<class Consumer>
	void consume(SequenceTime sequenceTime, Consumer consumer) {
		advance(sequenceTime);
		consume(consumer);
	}

	std::optional<RelativeEvent<T>> getNextEvent(bool includeFutureEvents = false) {
		if (m_pool.begin() == m_pool.end() ||
			(!includeFutureEvents &&
				m_pool.begin()->first > m_currentTime)) {
			return std::nullopt;
		}

		auto res = RelativeEvent<T>(m_pool.begin()->second, m_pool.begin()->first - m_prevTime);
		m_pool.erase(m_pool.begin());
		return res;
	}

private:
	SequenceTime m_prevTime;
	SequenceTime m_currentTime;
	std::multimap<SequenceTime, T> m_pool;
};

/**
 * @brief Synchronous handling
*/
template<class T>
class SequenceProcessor
{
	
public:
	SequenceProcessor(bool addOffEvents = true) 
		:
		 m_sequence(new Sequence<T>()),
		m_nextEventItr(m_sequence->events.cend())
	{}

	/**
	 * @brief Set new sequence.
	 * @param sequence 
	*/
	void setSequence(std::unique_ptr<Sequence<T>>& sequence)
	{
		m_sequence = std::move(sequence);
		sequenceChanged = true;
	}

	/**
	 * @brief Consume all left events in current sequence track.
	 * @tparam Consumer 
	 * @param consumer 
	*/
	template<class Consumer>
	void consume(Consumer consumer) {
		auto event = getNextEvent();
		while (event.has_value()) {
			consumer((RelativeEvent<T>&)event.value());
			event = getNextEvent();
		}
	}

	/**
	 * @brief Set new sequence track and consume all new events.
	 * @tparam Consumer 
	 * @param consumer 
	 * @param sequenceTrack 
	*/
	template<class Consumer>
	void consume(const SequenceTrack& sequenceTrack, Consumer consumer) {
		setSequenceTrack(sequenceTrack);
		consume(consumer);
	}

	/**
	 * @brief set new sequence track 
	 * @param sequenceTrack 
	*/
	void setSequenceTrack(const SequenceTrack& sequenceTrack) {

		if (sequenceChanged || sequenceTrack.Time != m_track.expectedNextTime())
		{
			m_nextEventItr = findNextEvent(sequenceTrack.Time);
			sequenceChanged = false;
		}
		else {
			while (getNextEvent().has_value())
			{
			}
		}
		m_track = sequenceTrack;
		m_currentTime = m_track.Time;
		m_durationLeft = m_track.Duration;
	}

	/**
	 * @brief get next event in current sequence track.
	 * @return next event or null if none.
	*/
	std::optional<RelativeEvent<T>> getNextEvent()
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

		RelativeEvent<T> res(m_nextEventItr->second, m_track.Duration - m_durationLeft);
		++m_nextEventItr;
		return res;
	}

private:

	EventMapIterator<T> findNextEvent(SequenceTime time) {
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

	std::unique_ptr<phrasa::Sequence<T>> m_sequence;
	bool sequenceChanged;

	SequenceTrack m_track;
	EventMapIterator<T> m_nextEventItr;
	SequenceTime m_currentTime;
	SequenceTime m_durationLeft;
};

}