add_library(connection impl/TcpConnection.cpp)

target_compile_definitions(connection PRIVATE
        JUCE_GLOBAL_MODULE_SETTINGS_INCLUDED=1)

target_sources( connection
  PRIVATE
    impl/TcpConnection.h 
    IConnection.h)

target_include_directories(connection 
  PUBLIC 
  .
  PRIVATE 
  ../../JUCE/modules)

#Tests
add_executable( connectionTest tests/ConnectionTest.cpp )
target_link_libraries(connectionTest connection gtest gtest_main juce::juce_core)
add_test( connectionTest connectionTest )