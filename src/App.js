import React, { useState, createRef, useEffect } from 'react'
import './style.scss';
import {
  ReplyIcon,
  RetweetIcon,
  LikeIcon,
  ShareIcon,
  VerifiedIcon
} from './icon';
import { AvatarLoader } from './loaders';
import { useScreenshot } from 'use-react-screenshot'
import { language } from './language';

const tweetFormat = tweet => {
  tweet = tweet
    .replace(/@([\w]+)/g, '<span>@$1</span>')
    .replace(/#([\wşçöğüıİ]+)/gi, '<span>#$1</span>')
    .replace(/(https?:\/\/[\w\.\/]+)/, '<span>$1</span>')
    .replace(/\n/g, '<br />');
  return tweet;
};

function convertImgToBase64(url, callback, outputFormat) {
  var canvas = document.createElement('CANVAS');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
    // Clean up
    canvas = null;
  };
  img.src = url;
}

const formatNumber = number => {
  if (!number) {
    number = 0;
  }
  if (number < 1000) {
    return number;
  }
  number /= 1000;
  number = String(number).split('.');

  return (
    number[0] + (number[1] > 100 ? ',' + number[1].slice(0, 1) + ' B' : ' B')
  );
};

export default function App() {
  const downloadRef = createRef();
  const tweetRef = createRef(null)
  const [name, setName] = useState();
  const [username, setUsername] = useState();
  const [isVerified, setIsVerified] = useState(0);
  const [tweet, setTweet] = useState();
  const [avatar, setAvatar] = useState();
  const [retweets, setRetweets] = useState(0);
  const [quoteTweets, setQuoteTweets] = useState(0);
  const [likes, setLikes] = useState(0);
  const [image, takeScreenshot] = useScreenshot();
  const getImage = () => takeScreenshot(tweetRef.current);
  const [langText, setLangText] = useState();
  const [lang, setLang] = useState('tr');

  useEffect(() => {
    setLangText(language[lang]);
  }, [lang]);

  const avatarHandle = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', function () {
      setAvatar(this.result);
    });
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (image) {
      downloadRef.current.click();
    }
  }, [image]);

  const fetchTwitterInfo = () => {
    fetch(
      `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`
    )
      .then(res => res.json())
      .then(data => {
        const twitter = data[0];
        console.log(twitter);

        convertImgToBase64(twitter.profile_image_url_https, function (
          base64Image
        ) {
          setAvatar(base64Image);
        });

        setName(twitter.name);
        setUsername(twitter.screen_name);
        setTweet(twitter.status.text);
        setRetweets(twitter.status.retweet_count);
        setLikes(twitter.status.favorite_count);
      });
  };

  return (
    <>
      <div className="tweet-settings">

        <h3>{langText?.settings}</h3>
        <ul>
          <li>
            <label>{langText?.name}</label>
            <input
              type="text"
              value={name}
              className="input"
              onChange={e => setName(e.target.value)}
            />
          </li>
          <li>
          <label>{langText?.username}</label>
            <input
              type="text"
              value={username}
              className="input"
              onChange={e => setUsername(e.target.value)}
            />
          </li>
          <li>
            <label>Tweet</label>
            <textarea
              type="text"
              value={tweet}
              className="textarea"
              maxLength="290"
              onChange={e => setTweet(e.target.value)}
            />
          </li>
          <li>
            <label>Avatar</label>
            <input type="file" className="input" onChange={avatarHandle} />
          </li>
          <li>
            <label>Retweet</label>
            <input
              type="number"
              value={retweets}
              className="input"
              onChange={e => setRetweets(e.target.value)}
            />
          </li>
          <li>
            <label>Alıntı Tweetler</label>
            <input
              type="number"
              placeholder=""
              value={quoteTweets}
              className="input"
              onChange={e => setQuoteTweets(e.target.value)}
            />
          </li>
          <li>
            <label>Beğeni</label>
            <input
              type="number"
              placeholder="Beğeni"
              value={likes}
              className="input"
              onChange={e => setLikes(e.target.value)}
            />
          </li>
          <li>
            <label>Doğrulanmış Hesap</label>
            <select
              onChange={e => setIsVerified(e.target.value)}
              defaultValue={isVerified}
            >
              <option value="1">Evet</option>
              <option value="0">Hayır</option>
            </select>
          </li>
          <button onClick={getImage}>Oluştur</button>
          <div className="download-url">
            {image && (
              <a ref={downloadRef} href={image} download="tweet.png">
                Tweeti İndir
              </a>
            )}
          </div>
        </ul>
      </div>
      <div className="tweet-container">
        <div className="app-language">
          <span
            onClick={() => setLang('tr')}
            className={lang === 'tr' && 'active'}
          >
            Türkçe
          </span>
          <span
            onClick={() => setLang('en')}
            className={lang === 'en' && 'active'}
          >
            English
          </span>
        </div>
        <div className="fetch-info">
          <input
            type="text"
            value={username}
            placeholder="Twitter kullanıcı adını yazın"
            onChange={e => setUsername(e.target.value)}
          />
          <button onClick={fetchTwitterInfo}>Bilgileri Çek</button>
        </div>
        <div className="tweet" ref={tweetRef}>
          <div className="tweet-author">
            {(avatar && <img src={avatar} />) || <AvatarLoader />}
            <div>
              <div className="name">
                {name || 'Ad Soyad'}
                <span>{isVerified == 1 && <VerifiedIcon width="19px" height="19px" />}</span>
              </div>
              <div className="username">@{username || 'KullanıcıAdi'}</div>
            </div>
          </div>
          <div className="tweet-content">
            <p dangerouslySetInnerHTML={{ __html: (tweet && tweetFormat(tweet)) || "Bu alana örnek tweet gelecek" }} />
          </div>
          <div className="tweet-stats">
            <span>
              <b>{formatNumber(retweets)}</b> Retweet
            </span>
            <span>
              <b>{formatNumber(quoteTweets)}</b> Alıntı Tweetler
            </span>
            <span>
              <b>{formatNumber(likes)}</b> Beğeni
            </span>
          </div>
          <div className="tweet-actions">
            <span><ReplyIcon /></span>
            <span><RetweetIcon /></span>
            <span><LikeIcon /></span>
            <span><ShareIcon /></span>
          </div>
        </div>

      </div>
    </>
  );
}