/* eslint-disable no-bitwise */

const { PostSeen, Post, User } = require('./database');
const { decryptJwt, verifyJWT } = require('../helpers/utils');
const { getPostPoll, getAllPostUtil, getPostRecations } = require('../helpers/ctr_utils');

const Clients = {};

const getToken = () => {
  let d = new Date().getTime();
  const token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

  return token;
};

/*
const broadcast = (data) => {
  for (const i in Clients) {
    Clients[i].send(JSON.stringify(data));
  }
};
*/

const sendMessageToClient = (message, socketId) => {
  console.log('send: %s', message, socketId);

  Clients[socketId].send(message);
};

const msToHMS = (ms) => {
  // 1- Convert to seconds:
  let seconds = ms / 1000;
  // 2- Extract hours:
  // const hours = parseInt(seconds / 3600, 10); // 3,600 seconds in 1 hour
  seconds %= 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = parseInt(seconds / 60, 10); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds %= 60;
  // return `${hours}:${minutes}:${seconds}`;
  return `${minutes}:${parseInt(seconds, 10)}`;
};

const calculateTestTime = (candidateAction, socketId) => {
  const durationMs = candidateAction.testId.duration * 60000;
  const startTime = new Date(candidateAction.createdAt).getTime();
  const etaTime = startTime + durationMs;
  const now = Date.now();
  sendMessageToClient(
    JSON.stringify({
      msg: 'DURATION_TIME',
      data: msToHMS(etaTime - now),
    }),
    socketId
  );
};

const testController = (socketId) => {
  sendMessageToClient(
    JSON.stringify({
      msg: 'TEST',
      data: 'OK',
    }),
    socketId
  );
};

const loginController = async (socketId, data) => {
  const userToken = data;

  try {
    const authToken = decryptJwt(userToken);
    const isVerifyJWT = verifyJWT(authToken);

    if (!isVerifyJWT || isVerifyJWT === undefined) {
      console.log('JWT Token Not Valid');

      return;
    }
    const { uuid } = isVerifyJWT;

    const u = await User.findOne({
      where: { uuid, is_delete: false },
      raw: true,
    });

    if (!u) {
      console.log('Mobile Auth User Not Found');

      return;
    }

    Clients[socketId].is_login = true;
    Clients[socketId].uuid = u.uuid;

    sendMessageToClient(
      JSON.stringify({
        msg: 'LOGIN',
        data: 'OK',
      }),
      socketId
    );
  } catch (error) {
    console.log(error);

    sendMessageToClient(
      JSON.stringify({
        msg: 'POST_SEEN',
        data: 'NOK',
      }),
      socketId
    );
  }
};

const postUtilController = async (socketId, data) => {
  const { postUUID } = data;
  const pollIdsQuery = [];

  try {
    if (!Clients[socketId].is_login) {
      console.log('not_login');
      sendMessageToClient(
        JSON.stringify({
          msg: 'POST_UTILS',
          data: 'NOK',
        }),
        socketId
      );

      return;
    }

    const post = await Post.findOne({
      where: { uuid: postUUID, is_publish: true, is_delete: false },
      raw: true,
      include: [{ model: Poll }],
    });
    const user = await User.findOne({ where: { uuid: Clients[socketId].uuid }, raw: true });

    if (!post) {
      console.log('ws_wrong_post_uuid');
      sendMessageToClient(
        JSON.stringify({
          msg: 'POST_UTILS',
          data: 'NOK',
        }),
        socketId
      );
      return;
    }
    if (!user) {
      console.log('ws_wrong_user_uuid');
      sendMessageToClient(
        JSON.stringify({
          msg: 'POST_UTILS',
          data: 'NOK',
        }),
        socketId
      );
      return;
    }
    if (post.poll_id) {
      pollIdsQuery.push({
        poll_id: post.poll_id,
      });
    }

    const { allPollAnswers, allPostReactions, allPostUserReaction } = await getAllPostUtil(user.id, pollIdsQuery, 2);

    await PostSeen.findOrCreate({
      where: {
        user_id: user.id,
        post_id: post.id,
      }
    });

    sendMessageToClient(
      JSON.stringify({
        msg: 'POST_UTILS',
        data: {
          uuid: post.uuid,
          poll: post.poll_id ? getPostPoll(allPollAnswers, post, user.id) : null,
          reactions: getPostRecations(allPostReactions, allPostUserReaction, post.id),
          //fix need comment_count
          //comment_count: postCommentCount(allPostComments, post.id),
        },
      }),
      socketId
    );
  } catch (error) {
    console.log(error);

    sendMessageToClient(
      JSON.stringify({
        msg: 'POST_UTILS',
        data: 'NOK',
      }),
      socketId
    );
  }
};

module.exports = {
  msToHMS,
  getToken,
  sendMessageToClient,
  postUtilController,
  calculateTestTime,
  testController,
  loginController,
  Clients,
};
