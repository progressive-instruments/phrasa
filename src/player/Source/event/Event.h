#pragma once

#include <memory>
#include <map>
#include <string>
#include <variant>
#include "ShiftTime.h"

namespace phrasa {

using Range = std::pair<double, double>;

struct Event
{
	using Value = std::variant<double, std::string, Range>;

	Event(SequenceTime _duration)
	:
		duration(_duration) 
	{}

	SequenceTime duration;
	std::map<std::string, Value> values;
};

}