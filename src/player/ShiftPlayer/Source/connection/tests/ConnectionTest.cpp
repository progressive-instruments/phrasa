#include <thread>
#include <chrono>
#include <algorithm>
#include "gtest/gtest.h"
#include "../impl/TcpConnection.h"
#include "juce_core/juce_core.h"

using namespace shift::connection::impl;
using namespace std::chrono_literals;

TEST(Connection, Construct) {
	shift::connection::impl::TcpConnection connection;
}


TEST(Connection, Connect) {
	shift::connection::impl::TcpConnection connection;
	bool connectionReceived = false;
	std::thread th([&]() {
		connection.waitForClientConnection(1000);
		connectionReceived = true;
	});
	std::this_thread::yield();
	juce::StreamingSocket socket;
	ASSERT_FALSE(connectionReceived);
	bool isConnected = socket.connect("localhost", 1000);
	ASSERT_TRUE(isConnected);
	std::this_thread::yield();
	ASSERT_TRUE(connectionReceived);
	th.join();
}

TEST(Connection, SendReceiveData) {
	shift::connection::impl::TcpConnection connection;
	bool receivedCorrectly = false;
	bool sentSuccesfully = false;
	std::thread th([&]() {
		std::array<uint8_t,16> buff;
		connection.waitForClientConnection(1000);
		connection.receive(buff.data(), buff.size());
		receivedCorrectly = std::all_of(buff.begin(), buff.end(), [](uint8_t val)->bool {return val == 1;});
		connection.send(buff.data(), buff.size());
		sentSuccesfully = true;
		});
	juce::StreamingSocket socket;
	bool isConnected = socket.connect("localhost", 1000);
	ASSERT_TRUE(isConnected);

	std::array<uint8_t,16> inputBuff;
	inputBuff.fill(1);
	int writtenBytes = socket.write(inputBuff.data(), inputBuff.size());
	ASSERT_EQ(writtenBytes, inputBuff.size());

	inputBuff.fill(0);
	int readBytes = socket.read(inputBuff.data(), inputBuff.size(), true);
	ASSERT_EQ(readBytes, inputBuff.size());
	ASSERT_TRUE(std::all_of(inputBuff.begin(), inputBuff.end(), [](uint8_t val)->bool {return val == 1;}));

	std::this_thread::yield();
	ASSERT_TRUE(receivedCorrectly);
	ASSERT_TRUE(sentSuccesfully);

	socket.close();

	th.join();
}
