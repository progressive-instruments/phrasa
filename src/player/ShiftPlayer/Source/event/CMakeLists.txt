add_library(event INTERFACE)

set_property(TARGET event PROPERTY CXX_STANDARD 17)

target_sources( event
  PRIVATE
    Event.h 
    IEventValue.h
    ShiftTime.h)

target_include_directories(event INTERFACE .)