#pragma once

#include <chrono>
#include <cmath>

namespace shift  {

class SequenceTime
{
public:
	SequenceTime()
		: m_time(0)
	{}

	SequenceTime(std::chrono::microseconds time)
		: m_time(time)
	{}

	static SequenceTime Max(SequenceTime a, SequenceTime b) {
		return a > b ? a : b;
	}

	static SequenceTime Min(SequenceTime a, SequenceTime b) {
		return a < b ? a : b;
	}

	SequenceTime(const SequenceTime& time) 
		: m_time(time.m_time)
	{}

	double getMilliSeconds() {
		return m_time.count() / 1000.0;
	}

	static SequenceTime FromMilliseconds(double ms) {
		return SequenceTime(std::chrono::microseconds(std::lround(ms * 1000)));
	}

	SequenceTime& operator=(const SequenceTime& time) {
		m_time = time.m_time;
		return *this;
	}

	bool operator<(const SequenceTime& time)  const {
		return m_time < time.m_time;
	}

	bool operator<=(const SequenceTime& time) const {
		return m_time <= time.m_time;
	}

	bool operator>(const SequenceTime& time) const {
		return m_time > time.m_time;
	}

	bool operator>=(const SequenceTime& time) const {
		return m_time >= time.m_time;
	}

	bool operator==(const SequenceTime& time) const {
		return m_time == time.m_time;
	}

	bool operator!=(const SequenceTime& time) const {
		return m_time != time.m_time;
	}

	void operator+=(const SequenceTime& time) {
		m_time += time.m_time;
	}

	void operator-=(const SequenceTime& time) {
		m_time -= time.m_time;
	}

	long long operator/(const SequenceTime& time) const {
		return m_time / time.m_time;
	}

	SequenceTime operator%(const SequenceTime& time) const {
		SequenceTime res;
		res.m_time = m_time % time.m_time;
		return res;
	}

	SequenceTime operator-(const SequenceTime& time) const {
		SequenceTime resTime(*this);
		resTime -= time;
		return resTime;
	}

	SequenceTime operator+(const SequenceTime& time) const {
		SequenceTime resTime(*this);
		resTime += time;
		return resTime;
	}

	SequenceTime operator*(unsigned int factor) const {
		SequenceTime res;
		res.m_time = m_time * factor;
		return res;
	}

	void AddMilliseconds(double ms)
	{
		m_time += std::chrono::microseconds(std::lround(ms * 1000));
	}
private:
	std::chrono::microseconds m_time;
};

} 