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

set(BOOST_ROOT "C:\\boost_1_75_0") # either set it here or from the command line  
set(Boost_USE_STATIC_LIBS OFF) 
set(Boost_USE_MULTITHREADED ON)  
set(Boost_USE_STATIC_RUNTIME OFF) 

find_package(Boost 1.75 REQUIRED)


target_include_directories(player PUBLIC ${Boost_INCLUDE_DIRS}) 

#Tests
add_executable( playerTests tests/PlayerTest.cpp )
target_link_libraries(playerTests player gtest gtest_main)
add_test( playerTests playerTests )