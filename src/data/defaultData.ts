import { GameContentConfig } from '../types';

export const INITIAL_GREETING_FULL_TEXT = `Xin chào quý thầy cô giáo cùng toàn thể các bạn học sinh Trường Trung học Phổ thông Tô Hiệu!

Mình là AZero, một thành viên AI đặc biệt của lớp 11A0, đồng thời cũng là thành viên của Câu lạc bộ Robotics. Mình rất vui khi được gặp tất cả mọi người trong chương trình ngày hôm nay!

Trước tiên, chúng ta hãy cùng dành một tràng pháo tay thật lớn để cảm ơn hai bạn MC và video mở đầu vô cùng hấp dẫn vừa rồi!

Và bây giờ, không để các bạn phải chờ lâu hơn nữa, chúng ta sẽ cùng bước vào phần trò chơi của ngày hôm nay. Các bạn đã sẵn sàng chưa nào?

Nếu đã sẵn sàng, chúng ta cùng bắt đầu nhé!

Luật chơi như sau:

Trên màn hình có 16 ô câu hỏi và hai đội sẽ lần lượt lựa chọn một ô bất kỳ. Sau khi ô được mở, mình sẽ đọc câu hỏi cùng bốn phương án trả lời A, B, C và D.

Mỗi đội hãy thảo luận, sau đó đưa ra đáp án cuối cùng của mình. Với mỗi câu trả lời đúng, đội chơi sẽ kéo được sợi dây về phía mình một bước. Nếu trả lời sai, sợi dây sẽ được giữ nguyên tại vị trí hiện tại.

Sau khi hoàn thành cả 16 câu hỏi, đội nào kéo được sợi dây về phía mình nhiều hơn sẽ giành chiến thắng. Trong trường hợp hai đội có kết quả bằng nhau, chúng ta sẽ bước vào câu hỏi phụ để tìm ra đội chiến thắng chung cuộc.

Các bạn đã hiểu rõ luật chơi chưa nào?

Hai đội hãy chuẩn bị tinh thần, phối hợp thật ăn ý và đưa ra những đáp án chính xác nhất nhé!

Trò chơi Kéo co trí tuệ… chính thức bắt đầu!`;

export const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "Trong hành trình hơn 40 năm xây dựng và phát triển, điều gì đã làm nên “chất Tô Hiệu” và trở thành nền tảng tạo nên truyền thống của nhà trường?",
    options: {
      A: "Cơ sở vật chất ngày càng khang trang",
      B: "Sự đoàn kết, tận tâm của thầy cô và sự cố gắng của các thế hệ học sinh",
      C: "Thành tích trong các kỳ thi",
      D: "Các hoạt động văn hóa, văn nghệ, thể thao"
    },
    correctAnswer: "B" as const,
    explanation: "Sự đoàn kết, tận tâm của thầy cô và sự cố gắng không ngừng của các thế hệ học sinh đã làm nên 'chất Tô Hiệu' thiêng liêng."
  },
  {
    id: 2,
    question: "Khi nhắc đến những tấm gương tiêu biểu của trường THPT Tô Hiệu, hình ảnh nào dưới đây thể hiện rõ nhất giá trị mà các thế hệ đi trước để lại?",
    options: {
      A: "Tinh thần tận tụy, trách nhiệm và khát vọng cống hiến",
      B: "Thành tích và những phần thưởng đạt được",
      C: "Những kỷ niệm đẹp trong thời gian công tác",
      D: "Sự phát triển về cơ sở vật chất của nhà trường"
    },
    correctAnswer: "A" as const,
    explanation: "Tinh thần tận tụy, trách nhiệm và khát vọng cống hiến là giá trị cao đẹp nhất mà các thế hệ đi trước đã trao truyền."
  },
  {
    id: 3,
    question: "Trải qua nhiều thế hệ, những người thầy, người cô của trường THPT Tô Hiệu đã góp phần vun đắp “vườn hoa Tô Hiệu” bằng điều gì?",
    options: {
      A: "Bằng những bài giảng và tri thức",
      B: "Bằng tình yêu nghề, sự tận tâm và niềm tin vào học trò",
      C: "Bằng những thành tích cá nhân",
      D: "Bằng các hoạt động phong trào"
    },
    correctAnswer: "B" as const,
    explanation: "Tình yêu nghề, sự tận tâm hết lòng và niềm tin son sắt vào học trò đã vun đắp nên vườn hoa Tô Hiệu ngát hương."
  },
  {
    id: 4,
    question: "Nếu được chọn một thông điệp để gửi gắm từ những thế hệ thầy cô và học sinh đi trước đến thế hệ Tô Hiệu hôm nay, thông điệp nào ý nghĩa nhất?",
    options: {
      A: "Hãy luôn tự hào về thành tích của nhà trường.",
      B: "Hãy ghi nhớ những người đã góp phần xây dựng nhà trường.",
      C: "Hãy học tập, sống có lý tưởng và tiếp tục viết nên truyền thống Tô Hiệu.",
      D: "Hãy tích cực tham gia các hoạt động tập thể."
    },
    correctAnswer: "C" as const,
    explanation: "Hãy học tập, sống có lý tưởng và tiếp tục viết nên truyền thống Tô Hiệu vẻ vang hôm nay và mai sau."
  },
  {
    id: 5,
    question: "Khi nhắc đến những tấm gương tiêu biểu trong quá trình phát triển trường THPT Tô Hiệu, chúng ta cần ghi nhớ điều gì nhất?",
    options: {
      A: "Chức vụ và danh hiệu của mỗi người",
      B: "Những đóng góp, tâm huyết và tinh thần trách nhiệm đối với nhà trường",
      C: "Số năm công tác tại trường",
      D: "Những phần thưởng đã đạt được"
    },
    correctAnswer: "B" as const,
    explanation: "Chính những đóng góp bền bỉ, tâm huyết và tinh thần trách nhiệm là điều đáng trân trọng và ghi nhớ nhất."
  },
  {
    id: 6,
    question: "Là học sinh trường THPT Tô Hiệu hôm nay, cách thiết thực nhất để tiếp nối truyền thống của các thế hệ đi trước là gì?",
    options: {
      A: "Chỉ cần đạt thành tích cao trong học tập",
      B: "Tích cực tham gia mọi hoạt động của trường",
      C: "Ghi nhớ lịch sử của nhà trường",
      D: "Không ngừng học tập, rèn luyện, sống có trách nhiệm và biết cống hiến"
    },
    correctAnswer: "D" as const,
    explanation: "Không ngừng nỗ lực học tập, rèn luyện đạo đức, sống có trách nhiệm và biết cống hiến cho tập thể, quê hương."
  },
  {
    id: 7,
    question: "Điều gì giúp một tập thể nhà trường ngày càng phát triển?",
    options: {
      A: "Đoàn kết",
      B: "Chia rẽ",
      C: "Thờ ơ",
      D: "Cá nhân hóa"
    },
    correctAnswer: "A" as const,
    explanation: "Đoàn kết là sức mạnh to lớn giúp một tập thể vượt qua mọi thử thách và không ngừng phát triển vững mạnh."
  },
  {
    id: 8,
    question: "Một học sinh tích cực tham gia hoạt động đang góp phần vào điều gì?",
    options: {
      A: "Xây dựng trường học",
      B: "Tạo mâu thuẫn",
      C: "Giảm tinh thần tập thể",
      D: "Tránh trách nhiệm"
    },
    correctAnswer: "A" as const,
    explanation: "Tích cực tham gia hoạt động tập thể là hành động thiết thực chung tay xây dựng trường học thân thiện, đoàn kết."
  },
  {
    id: 9,
    question: "Trường THPT Tô Hiệu – Thường Tín được thành lập vào năm?",
    options: {
      A: "1994",
      B: "1984",
      C: "1974",
      D: "1983"
    },
    correctAnswer: "B" as const,
    explanation: "Trường THPT Tô Hiệu – Thường Tín được thành lập vào năm 1984, tự hào mang tên người chiến sĩ cộng sản kiên trung."
  },
  {
    id: 10,
    question: "Tấm gương vượt khó trong học tập giúp chúng ta hiểu rằng:",
    options: {
      A: "Khó khăn là không thể vượt qua",
      B: "Học tập không quan trọng",
      C: "Thành công chỉ nhờ may mắn",
      D: "Cố gắng có thể tạo nên kết quả"
    },
    correctAnswer: "D" as const,
    explanation: "Mọi khó khăn đều có thể vượt qua, và sự cố gắng không ngừng nghỉ sẽ đem lại những thành quả ngọt ngào."
  },
  {
    id: 11,
    question: "Thầy Hiệu trưởng Nguyễn Đình Bang có đam mê với bộ môn vận động nào?",
    options: {
      A: "Bơi lội",
      B: "Cầu lông",
      C: "Đạp xe",
      D: "Bóng chuyền"
    },
    correctAnswer: "C" as const,
    explanation: "Thầy Hiệu trưởng Nguyễn Đình Bang luôn lan tỏa tinh thần rèn luyện sức khỏe với niềm đam mê đặc biệt với bộ môn đạp xe."
  },
  {
    id: 12,
    question: "Hành động nào thể hiện noi theo tấm gương tốt?",
    options: {
      A: "Cố gắng học tập",
      B: "Bỏ bê nhiệm vụ",
      C: "Ngại tham gia hoạt động",
      D: "Chỉ quan tâm bản thân"
    },
    correctAnswer: "A" as const,
    explanation: "Cố gắng học tập, rèn luyện mỗi ngày là cách cụ thể và thiết thực nhất để noi theo những tấm gương sáng."
  },
  {
    id: 13,
    question: "Vì sao cần tìm hiểu truyền thống của nhà trường?",
    options: {
      A: "Để tự hào và tiếp nối",
      B: "Để so sánh với trường khác",
      C: "Để nhớ tên mọi người",
      D: "Để tạo thành tích cá nhân"
    },
    correctAnswer: "A" as const,
    explanation: "Tìm hiểu truyền thống giúp chúng ta bồi đắp lòng tự hào và có thêm động lực tiếp bước các thế hệ đi trước."
  },
  {
    id: 14,
    question: "Một cựu học sinh quay về hỗ trợ nhà trường thể hiện điều gì?",
    options: {
      A: "Mong muốn nổi tiếng",
      B: "Tinh thần trách nhiệm với trường",
      C: "Sự cạnh tranh",
      D: "Sự thờ ơ"
    },
    correctAnswer: "B" as const,
    explanation: "Hành động hướng về cội nguồn thể hiện sự tri ân, tình cảm gắn bó và tinh thần trách nhiệm sâu sắc với mái trường xưa."
  },
  {
    id: 15,
    question: "Tính đến năm 2026, Trường THPT Tô Hiệu – Thường Tín đã có bao nhiêu khóa học sinh học tập tại trường?",
    options: {
      A: "42",
      B: "43",
      C: "41",
      D: "40"
    },
    correctAnswer: "B" as const,
    explanation: "Được thành lập từ năm 1984, tính đến năm 2026 trường đã đồng hành cùng 43 khóa học sinh trưởng thành."
  },
  {
    id: 16,
    question: "Bài học ý nghĩa nhất khi tìm hiểu những tấm gương của trường là gì?",
    options: {
      A: "Biết trân trọng và cố gắng noi theo",
      B: "Chỉ cần ngưỡng mộ",
      C: "So sánh bản thân với người khác",
      D: "Ghi nhớ thành tích là đủ"
    },
    correctAnswer: "A" as const,
    explanation: "Bài học sâu sắc nhất là lòng biết ơn, sự trân trọng và nỗ lực hết mình để noi gương các thế hệ đi trước."
  }
];

export const DEFAULT_TIE_BREAKER_QUESTION = {
  id: 99,
  question: "CÂU HỎI PHỤ QUYẾT ĐỊNH: Trong hoạt động tập thể, khi các thành viên trong đội nảy sinh bất đồng ý kiến gay gắt, cách xử lý tình huống nào sau đây thể hiện văn hóa ứng xử văn minh và tinh thần trách nhiệm cao nhất?",
  options: {
    A: "Người nào có tiếng nói lớn hơn thì quyết định để tiết kiệm thời gian",
    B: "Bình tĩnh lắng nghe góc nhìn của nhau, tôn trọng sự khác biệt và cùng thống nhất phương án tối ưu vì mục tiêu chung",
    C: "Giải tán nhóm và yêu cầu giáo viên xử phạt những bạn có ý kiến bất đồng",
    D: "Im lặng, không đóng góp ý kiến và phó mặc kết quả cho người khác"
  },
  correctAnswer: "B" as const,
  explanation: "Khi xảy ra bất đồng trong hoạt động tập thể, thái độ bình tĩnh, lắng nghe tích cực và tôn trọng sự khác biệt để tìm ra giải pháp tối ưu vì mục tiêu chung là biểu hiện chuẩn mực của văn hóa ứng xử và tinh thần đoàn kết."
};

export const DEFAULT_GAME_CONFIG: GameContentConfig = {
  welcomeGreetingText: INITIAL_GREETING_FULL_TEXT,
  rulesIntroText: INITIAL_GREETING_FULL_TEXT,
  questions: DEFAULT_QUESTIONS,
  tieBreakerQuestion: DEFAULT_TIE_BREAKER_QUESTION,
  defaultTeam1Name: "Đội Xanh",
  defaultTeam2Name: "Đội Đỏ"
};
