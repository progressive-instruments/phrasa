#pragma once

#include "Event.h"

namespace phrasa::instrument {

struct SequenceTrack
{
	void Advance() {
		Time = (Time + Duration) % SequenceLength;
	}
	SequenceTime expectedNextTime() {
		return (Time + Duration) % SequenceLength;
	}
	SequenceTime Time;
	SequenceTime Duration;

	SequenceTime SequenceLength;
};

}