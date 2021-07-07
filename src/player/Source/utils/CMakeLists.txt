add_library(utils INTERFACE)


target_sources( utils
  PRIVATE
    ProducerConsumerQueue.h )

target_include_directories(utils INTERFACE .)