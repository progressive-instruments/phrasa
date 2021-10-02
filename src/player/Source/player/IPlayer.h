#pragma once

#include <vector>

#include "Event.h"
#include "Sequence.h"
namespace phrasa::player {

enum class PlayMode {
	Play, 
	Stop, 
	Pause
};

struct PlayerState {
	SequenceTime currentPosition;
	SequenceTime endTime;
};

class IPlayer
{
public:
	virtual ~IPlayer() {}
	virtual void setPlayMode(PlayMode mode) = 0;
	virtual void setSequencePosition(double sequencePosition)=0;
	virtual void setSequence(UniqueSequenceMap<std::shared_ptr<Event>> sequence, SequenceTime endTime) = 0;
	virtual void getState(PlayerState& state)=0;
};

}