#pragma once

#include <memory>
#include <map>
#include <string>

#include "ShiftTime.h"
#include "IEventValue.h"

namespace shift::player {

struct Event
{
	Event(Time _startTime, Time _duration)
	:
		startTime(_startTime),
		duration(_duration) 
	{}

	Time startTime;
	Time duration;
	std::map<std::string, std::unique_ptr<IEventValue>> values;
};

}