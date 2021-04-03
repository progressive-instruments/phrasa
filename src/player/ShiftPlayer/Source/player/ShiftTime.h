#pragma once

namespace shift::player {

struct Time
{
	Time(double _timeMs) {
		timeMs = _timeMs;
	}
	double timeMs;
};

} 