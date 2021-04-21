#pragma once

#include <memory>
#include <map>
#include <string>
#include <set>

#include "ShiftTime.h"
#include "IEventValue.h"

namespace phrasa {

struct Event
{
	Event(SequenceTime _duration)
	:
		duration(_duration) 
	{}

	SequenceTime duration;
	std::map<std::string, std::shared_ptr<IEventValue>> values;
};


struct Sequence
{
public:
	std::multimap<SequenceTime, std::shared_ptr<Event>> events;
};

}