#pragma once

#include <vector>

#include "Event.h"

namespace shift::player {

struct Sequence
{
	std::vector<std::unique_ptr<Event>> events;
};

class IPlayer
{
public:
	virtual void setSequence(std::shared_ptr<Sequence> sequence, Time endTime) = 0;
};

}