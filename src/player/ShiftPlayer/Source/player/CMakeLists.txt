add_library(player impl/Player.cpp)

target_sources( player
  PRIVATE
    impl/Player.h
    Event.h
    IEventValue.h
    IPlayer.h
    IPlayerAudioProcessor.h
    ShiftTime.h)

target_include_directories(player PRIVATE .)


#Tests
add_executable( playerTests tests/PlayerTest.cpp )
target_link_libraries(playerTests player gtest gtest_main)
add_test( playerTests playerTests )