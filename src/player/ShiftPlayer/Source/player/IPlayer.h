#pragma once

#include <vector>

#include "Event.h"

namespace shift::player {


class IPlayer
{
public:
	virtual ~IPlayer() {}

	virtual void setSequence(std::unique_ptr<Sequence> sequence, SequenceTime endTime) = 0;
};

}