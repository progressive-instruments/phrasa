#include <thread>
#include <chrono>
#include <algorithm>
#include "gtest/gtest.h"
#include "../impl/SequenceProcessor.h"

using namespace phrasa;
using namespace phrasa::instrument;
using namespace phrasa::instrument::impl;

using namespace std::chrono_literals;

TEST(SequenceProcessor, Construct) {
	SequenceProcessor processor;
	ASSERT_FALSE(processor.getNextEvent().has_value());
}

void assertEvent(SequenceProcessor& processor , SequenceTime expectedTime, std::shared_ptr<Event> expectedEvent) {
	auto resEvent = processor.getNextEvent();
	ASSERT_TRUE(resEvent.has_value());
	ASSERT_TRUE(resEvent->event == expectedEvent);
	ASSERT_TRUE(resEvent->relativeTime == expectedTime);
}


TEST(SequenceProcessor, OneEvent) {
	auto firstEvent = std::make_pair(SequenceTime(80us), std::make_shared<Event>(phrasa::SequenceTime()));

	std::unique_ptr<Sequence> seq(new Sequence());
	seq->events.insert(firstEvent);

	SequenceProcessor processor;
	processor.setSequence(seq);

	SequenceTrack track;
	track.Time = 0us;
	track.Duration = 50us;
	track.SequenceLength = 110us;

	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(50us);
	processor.setSequenceTrack(track);
	assertEvent(processor, 30us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(50us);
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(50us);
	processor.setSequenceTrack(track);
	assertEvent(processor, 40us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

}

TEST(SequenceProcessor, ZeroEvent) {
	auto firstEvent = std::make_pair(SequenceTime(0us), std::make_shared<Event>(phrasa::SequenceTime()));
	auto secondEvent = std::make_pair(SequenceTime(1000us), std::make_shared<Event>(phrasa::SequenceTime()));

	std::unique_ptr<Sequence> seq(new Sequence());
	seq->events.insert(firstEvent);
	seq->events.insert(secondEvent);

	SequenceProcessor processor;
	processor.setSequence(seq);

	SequenceTrack track;
	track.Time = 0us;
	track.Duration = 500us;
	track.SequenceLength = 2000us;

	processor.setSequenceTrack(track);
	assertEvent(processor, 0us, firstEvent.second);

	track.Advance(500us);
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(500us);
	processor.setSequenceTrack(track);
	assertEvent(processor, 0us, secondEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(500us);
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(500us);
	processor.setSequenceTrack(track);
	assertEvent(processor, 0us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());
}

TEST(SequenceProcessor, Processing) {


	auto firstEvent = std::make_pair(SequenceTime(600us),std::make_shared<Event>(phrasa::SequenceTime()));
	auto secondEvent = std::make_pair(SequenceTime(1200us), std::make_shared<Event>(phrasa::SequenceTime()));
	auto thirdEvent = std::make_pair(SequenceTime(1400us),std::make_shared<Event>(phrasa::SequenceTime()));
	
	std::unique_ptr<Sequence> seq (new Sequence());
	seq->events.insert(thirdEvent);
	seq->events.insert(firstEvent);
	seq->events.insert(secondEvent);

	SequenceProcessor processor;
	processor.setSequence(seq);
	
	ASSERT_FALSE(processor.getNextEvent().has_value());

	SequenceTrack track;
	track.Time = 0us;
	track.Duration = 500us;
	track.SequenceLength = 1600us;
	processor.setSequenceTrack(track);
	
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(500us);
	processor.setSequenceTrack(track);

	assertEvent(processor, 100us, firstEvent.second);

	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(500us);
	processor.setSequenceTrack(track);

	assertEvent(processor, 200us, secondEvent.second);
	assertEvent(processor, 400us, thirdEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(500us);
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance(500us);
	processor.setSequenceTrack(track);
	assertEvent(processor, 200us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());
}

TEST(EventHolder, Construct) {
	EventHolder holder;
	ASSERT_FALSE(holder.getNextEvent().has_value());
}

TEST(EventHolder, Process) {
	EventHolder holder;
	SequenceTime time = 100us;
	auto ev = std::make_shared<Event>(phrasa::SequenceTime(150us));
	holder.addEvent(ev);
	holder.advance(time);
	ASSERT_FALSE(holder.getNextEvent().has_value());
	holder.advance(time);
	auto resEvent = holder.getNextEvent();
	ASSERT_TRUE(resEvent.has_value());
	ASSERT_TRUE(resEvent->event == ev);
	ASSERT_TRUE(resEvent->relativeTime == 50us);

	ASSERT_FALSE(holder.getNextEvent().has_value());


}