#pragma once

#include <memory>
#include <map>
#include <string>

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

}