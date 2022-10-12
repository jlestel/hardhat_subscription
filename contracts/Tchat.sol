//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

contract Tchat {
    // Info du message
    struct Message {
        // expéditeur
        address owner;
        // contenu du message
        string message;
        // heure d'envois
        uint256 timestamp;
        // destinataire
        address recipient;
    }

    // permet de connaitre l'index du dernier message envoyé
    uint256 private _indexMessage;
    // liste des messages
    mapping(uint256 => Message) private _messages;
    // liste des messages par utilisateur
    mapping(address => uint256[]) private _userMessages;

    event MessageAdded(address sender, address receiver);

    constructor() {}

    function addMessage(string memory text, address to) public {
        // message
        require(
            msg.sender != to,
            "on ne peut pas envoyer un message a soit meme"
        );
        // msg.sender est l'address de la personne qui appel cette méthode
        // block.timestamp est le timestamp du block actuellement miné
        Message memory message = Message(msg.sender, text, block.timestamp, to);
        // on stock le message
        _messages[_indexMessage] = message;
        // on stock l'index de ce message chez l'expéditeur et le destinataire
        _userMessages[msg.sender].push(_indexMessage);
        _userMessages[to].push(_indexMessage);
        // on émet un event afin de facilement intercepter les messages envoyés
        emit MessageAdded(msg.sender, to);
        // on oublie pas de passer à l'index suivant
        _indexMessage++;
    }

    function getMessages() public view returns (Message[] memory) {
        // on va récupérer les messages de la personne qui appel cette méthode
        uint256 length = _userMessages[msg.sender].length;
        // va soulever une erreur si aucun message pour cet utilisateur
        require(length > 0, "aucun message");

        // on va initialiser un tableau qui contiendra tous nos messages
        // ceci est à titre d'exemple, dans la réalité si le tableau est trop grand l'appel peu échoué
        Message[] memory myMessages = new Message[](length);
        for (uint256 index = 0; index < length; index++) {
            // on doit déjà récupérer l'index du message avant de récupérer son contenu
            uint256 messageIndex = _userMessages[msg.sender][index];
            myMessages[index] = _messages[messageIndex];
        }
        return myMessages;
    }
}
