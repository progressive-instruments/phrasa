#pragma once

#include <memory>

#include "IPlayerController.h"
#include "IPlayer.h"
#include "impl/generated/note_message.pb.h"
#include "IConnection.h"
#include <thread>
#include <map>
#include <functional>

namespace phrasa::playerctrl::impl {

class PlayerController : public IPlayerController
{
public:
	PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection);

private:
	using MessageHandler = std::function<void(player::IPlayer&, const shift_processor::ShiftPlayerMessage&)>;
	using MessageHandlerMap = std::map<shift_processor::ShiftPlayerMessage::MessageCase, MessageHandler>;
	static MessageHandlerMap m_messageHandlers;

	static std::map<shift_processor::PlayMode, player::PlayMode> playModeMap;

	static void setSequenceHandler(player::IPlayer& player, const shift_processor::ShiftPlayerMessage& message);
	static void setPlayModeHandler(player::IPlayer& player, const shift_processor::ShiftPlayerMessage& message);
	static void PlayerController::parseSetSequenceMessage(const shift_processor::SetSequenceMessage& msg, UniqueSequenceMap<std::shared_ptr<Event>>& sequenceOutput, SequenceTime& sequenceLengthOut);

	static void communicationRoutine(PlayerController* communication);
	
	std::shared_ptr<player::IPlayer> m_player;
	std::shared_ptr<connection::IConnection> m_connection;
	std::thread m_commRoutineThread;
};

}