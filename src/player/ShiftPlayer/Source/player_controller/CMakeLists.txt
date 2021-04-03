add_library(player_controller impl/PlayerController.cpp)

target_sources( player_controller
  PRIVATE
    IPlayerController.h
    impl/PlayerController.h)

target_include_directories(player_controller 
  PRIVATE 
    . 
    ../player 
    ../connection)

#Tests
add_executable( playerControlTest tests/PlayerControlTest.cpp )
target_link_libraries(playerControlTest connection gtest gtest_main)
add_test( playerControlTest playerControlTest )