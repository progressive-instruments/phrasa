#pragma once

#include "Event.h"

namespace shift::instrument {

struct SequenceTrack
{
	SequenceTime Time;
	SequenceTime Duration;

	SequenceTime SequenceLength;
};

}