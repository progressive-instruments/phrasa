#include <thread>
#include <chrono>
#include <algorithm>
#include "gtest/gtest.h"
#include "../impl/SequenceProcessor.h"

using namespace shift;
using namespace shift::instrument;
using namespace shift::instrument::impl;

using namespace std::chrono_literals;

TEST(SequenceGenerator, Construct) {
	SequenceProcessor processor;
	ASSERT_FALSE(processor.hasEvents());
}

void assertEvent(SequenceProcessor& processor , SequenceTime expectedTime, std::shared_ptr<Event> expectedEvent) {
	ASSERT_TRUE(processor.hasEvents());
	auto resEvent = processor.getNextEvent();
	ASSERT_TRUE(resEvent.event == expectedEvent);
	ASSERT_TRUE(resEvent.relativeTime == expectedTime);
}

TEST(SequenceGenerator, Processing) {


	auto firstEvent = std::make_pair(SequenceTime(600us),std::make_shared<Event>(shift::SequenceTime()));
	auto secondEvent = std::make_pair(SequenceTime(1200us), std::make_shared<Event>(shift::SequenceTime()));
	auto thirdEvent = std::make_pair(SequenceTime(1400us),std::make_shared<Event>(shift::SequenceTime()));
	
	std::unique_ptr<Sequence> seq (new Sequence());
	seq->events.insert(thirdEvent);
	seq->events.insert(firstEvent);
	seq->events.insert(secondEvent);

	SequenceProcessor processor;
	processor.setSequence(seq);
	
	ASSERT_FALSE(processor.hasEvents());

	SequenceTrack track;
	track.Time = 0us;
	track.Duration = 500us;
	track.SequenceLength = 1600us;
	processor.setSequenceTrack(track);
	
	ASSERT_FALSE(processor.hasEvents());

	track.Advance(500us);
	processor.setSequenceTrack(track);

	assertEvent(processor, 100us, firstEvent.second);

	ASSERT_FALSE(processor.hasEvents());

	track.Advance(500us);
	processor.setSequenceTrack(track);

	assertEvent(processor, 200us, secondEvent.second);
	ASSERT_TRUE(processor.hasEvents());
	assertEvent(processor, 400us, thirdEvent.second);
	ASSERT_FALSE(processor.hasEvents());

	track.Advance(500us);
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.hasEvents());

	track.Advance(500us);
	processor.setSequenceTrack(track);
	ASSERT_TRUE(processor.hasEvents());
	assertEvent(processor, 200us, firstEvent.second);
}

TEST(EventHolder, Construct) {
	EventHolder holder;
	ASSERT_FALSE(holder.hasEvents());
}

TEST(EventHolder, Process) {
	EventHolder holder;
	SequenceTime time = 100us;
	auto ev = std::make_shared<Event>(shift::SequenceTime(150us));
	holder.addEvent(ev);
	holder.advance(time);
	ASSERT_FALSE(holder.hasEvents());
	holder.advance(time);
	ASSERT_TRUE(holder.hasEvents());
	auto resEvent = holder.getNextEvent();
	ASSERT_TRUE(resEvent.event == ev);
	ASSERT_TRUE(resEvent.relativeTime == 50us);
}