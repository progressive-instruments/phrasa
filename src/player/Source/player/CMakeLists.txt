add_library(player impl/Player.cpp)

target_sources( player
  PRIVATE
    impl/Player.h
    impl/UniquePtrLockFreeQueue.h
    IPlayer.h
    impl/ManagedAudioBuffer.h
    IPlayerAudioProcessor.h)

target_compile_definitions(player PRIVATE
  JUCE_GLOBAL_MODULE_SETTINGS_INCLUDED=1)

target_include_directories(player 
  PUBLIC 
    .
  PRIVATE
    ../../JUCE/modules
    ../audio
    ../event
    ../instrument)

target_link_libraries(player audio)


target_include_directories(player PUBLIC ${Boost_INCLUDE_DIRS}) 

#Tests
add_executable( playerTests tests/PlayerTest.cpp )
target_link_libraries(playerTests player gtest gtest_main)
add_test( playerTests playerTests )