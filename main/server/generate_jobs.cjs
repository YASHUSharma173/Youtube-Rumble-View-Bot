const rumble_core = require("rumble-core");
const { db } = require("./init_start.cjs");
const rumble_selfbot_api = require("rumble-selfbot-api");

let selfbot_api;
let rumble_selfbot_api_instance;

(async () => {
    try {
        const rumbleSelfbotModule = await import("rumble-selfbot-api");
        rumble_selfbot_api = rumbleSelfbotModule.selfbot;
        rumble_selfbot_api_instance = new rumble_selfbot_api();
    } catch (e) {
        console.error("Error loading rumble-selfbot-api:", e);
    }
})();

let accountOnlyTypes = ["suggestions", "subscribers"];

function clamp(num, min, max) {
    return num < min ? min : num > max ? max : num;
}

function calculateAction(work_video) {
    let likePercent = clamp(work_video.likePercent || 0, 0, 100);
    let dislikePercent = clamp(work_video.dislikePercent || 0, 0, 100);
    let subscribePercent = clamp(work_video.subscribePercent || 0, 0, 100);

    let percent1 = Math.random() * 100;
    let percent2 = Math.random() * 100;
    let percent3 = Math.random() * 100;

    if (percent1 < likePercent) {
        return ["like", percent3 < subscribePercent && "subscribe" || "none"];
    }
    if (percent2 < dislikePercent) {
        return ["dislike", percent3 < subscribePercent && "subscribe" || "none"];
    }
    if (percent3 < subscribePercent) {
        return [percent1 < likePercent ? "like" : "none", "subscribe"];
    }
    return ["none"];
}

function generateJob(work_video, work_proxies, video_id, videoInfo, isRumble, work_account) {
    let available_watch_types = work_video.available_watch_types;
    if (work_account) {
        available_watch_types = available_watch_types
            .filter(v => !accountOnlyTypes.includes(v));
    }

    let job = {};
    let filters = {};

    if (work_video.filters.duration !== "any") {
        filters.duration = work_video.filters.duration.split(" minutes")[0].replace("_", "-");
    }
    if (work_video.filters.sort_by !== "relevance") {
        filters.sort_by = work_video.filters.sort_by.replace("_", "-");
    }
    if (work_video.filters.upload_date !== "any") {
        filters.upload_date = work_video.filters.upload_date.replace("_", "-");
    }
    if (work_video.filters.features.length > 0) {
        filters.features = work_video.filters.features;
    }

    job.referer = random(work_video.referrals);
    job.keyword_chosen = random([...work_video.keywords, videoInfo.title]);
    job.video_info = videoInfo;
    job.filters = filters;
    job.watch_type = random(available_watch_types);
    job.proxy = random(work_proxies);
    job.video_id = video_id;
    job.isRumble = isRumble;

    if (videoInfo.isLive) {
        job.watch_time = work_video.livestream_watch_time;
        job.watch_entire_livestream = work_video.watch_entire_livestream;
    } else {
        if (work_video.comments.length > 0) {
            let comment_index = random(0, work_video.comments.length);
            let comment = work_video.comments[comment_index];
            work_video.comments.splice(comment_index, 1);

            job.account = {
                ...work_account,
                like: action[0] == "like",
                dislike: action[1] == "dislike",
                subscribe: action[2] == "subscribe",
                comment: comment,
            };
        }
    }

    return job;
}

// Database se dynamic links fetch karke jobs generate karne ka function
async function generateJobs(work_video, work_proxies) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM rumble_links`, [], async (err, rows) => {
            if (err) {
                console.error("Database error fetching links:", err.message);
                return resolve([]);
            }

            let jobs = [];
            for (let row of rows) {
                let video_id = row.url; // Yahan database ka URL use ho raha hai
                let isRumble = true;
                let videoInfo = { title: "Rumble Video", isLive: false };

                let job = generateJob(work_video, work_proxies, video_id, videoInfo, isRumble, null);
                jobs.push(job);
            }
            resolve(jobs);
        });
    });
}

module.exports = { generateJobs };
