#pragma once

#include <memory>

#include "IPlayerController.h"
#include "IPlayer.h"
#include "impl/generated/note_message.pb.h"
#include "IConnection.h"
#include <thread>

namespace phrasa::playerctrl::impl {

class PlayerController : public IPlayerController
{
public:
	PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection);

private:
	void PlayerController::parseSetSequenceMessage(const shift_processor::SetSequenceMessage& msg, UniqueSequenceMap& sequenceOutput, SequenceTime& sequenceLengthOut);

	static void communicationRoutine(PlayerController* communication);

	std::shared_ptr<player::IPlayer> m_player;
	std::shared_ptr<connection::IConnection> m_connection;
	std::thread m_commRoutineThread;
};

}