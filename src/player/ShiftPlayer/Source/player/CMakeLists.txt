add_library(player impl/Player.cpp)

target_sources( player
  PRIVATE
    impl/Player.h
    impl/UniquePtrLockFreeQueue.h
    IPlayer.h
    IPlayerAudioProcessor.h)

target_include_directories(player 
  PRIVATE 
    .
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