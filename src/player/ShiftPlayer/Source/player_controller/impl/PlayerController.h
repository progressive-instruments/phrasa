#pragma once

#include <memory>

#include "IPlayerController.h"
#include "IPlayer.h"
#include "IConnection.h"

namespace shift::playerctrl::impl {

class PlayerController : public IPlayerController
{
public:
	PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection)
		: 
		m_player(player),
		m_connection(connection)
	{}

private:
	std::shared_ptr<player::IPlayer> m_player;
	std::shared_ptr<connection::IConnection> m_connection;
};

}