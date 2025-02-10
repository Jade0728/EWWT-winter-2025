const mongoose = require('mongoose');

// 그룹 스키마 정의
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    color: {
        type: String,
        default: '#000000'
    }
});

// 그룹 모델 생성
const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
