#include "gtest/gtest.h"
#include "../impl/TcpConnection.h"

using namespace shift::connection::impl;

TEST(Connection, Construct) {
	shift::connection::impl::TcpConnection connection;
}
