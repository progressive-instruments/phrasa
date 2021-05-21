#pragma once

#include <vector>

#include "Event.h"
#include "Sequence.h"
namespace phrasa::player {


class IPlayer
{
public:
	virtual ~IPlayer() {}

	virtual void setSequence(UniqueSequenceMap<std::shared_ptr<Event>> sequence, SequenceTime endTime) = 0;
};

}