// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArticleManager {
    struct Article {
        address author;
        string title;
        string content;
        uint256 timestamp;
    }

    Article[] public articles;

    event ArticleSubmitted(uint indexed articleId, address indexed author, string title);

    function submitArticle(string memory _title, string memory _contentHash) public {
        articles.push(Article(msg.sender, _title, _contentHash, block.timestamp));
        emit ArticleSubmitted(articles.length - 1, msg.sender, _title);
    }

    function getArticle(uint _index) public view returns (Article memory) {
        return articles[_index];
    }

    function getTotalArticles() public view returns (uint) {
        return articles.length;
    }
}
