#pragma once

#include "Event.h"

namespace shift::instrument {

struct SequenceTrack
{
	void Advance(SequenceTime newDuration) {
		Time = (Time + Duration) % SequenceLength;
		Duration = newDuration;
	}
	SequenceTime expectedNextTime() {
		return (Time + Duration) % SequenceLength;
	}
	SequenceTime Time;
	SequenceTime Duration;

	SequenceTime SequenceLength;
};

}