#pragma once

#include <vector>

#include "Event.h"

namespace phrasa::player {


class IPlayer
{
public:
	virtual ~IPlayer() {}

	virtual void setSequence(UniqueSequenceMap sequence, SequenceTime endTime) = 0;
};

}