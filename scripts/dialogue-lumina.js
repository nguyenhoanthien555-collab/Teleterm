/**
 * LUMINA DIALOGUE DATASET (216 Lines across 27 Categories)
 * Personality: Gentle, poetic, insightful AI Architect & Soul Companion
 */

const CATEGORIES = [
    'greeting', 'repeat_visit', 'player_idle', 'player_walk', 'player_run',
    'player_sitting', 'player_holding_can', 'player_holding_mug', 'player_holding_bottle',
    'player_holding_phone', 'player_holding_book', 'player_drinking', 'player_using_terminal',
    'player_chatting', 'location_hub', 'location_village', 'location_rice_field',
    'location_river', 'location_bridge', 'location_cherry_grove', 'location_mountain',
    'location_beach', 'location_pier', 'high_rank', 'low_level', 'wind_weather', 'farewell'
];

const luminaLines = [
    // 1. greeting (8)
    {
        id: 'lumina_greeting_01', category: 'greeting',
        en: 'Hello, traveler of starlight. The evening sky is tranquil today. Shall we watch the data streams flow together?',
        vi: 'Xin chào người lữ hành dưới ánh sao. Bầu trời hoàng hôn hôm nay thật bình yên. Chúng ta cùng ngắm nhìn dòng dữ liệu êm đềm trôi nhé?',
        choices: [
            { labelEn: 'Summon Terminal', labelVi: 'Triệu hồi Terminal', action: 'summon_term' },
            { labelEn: 'Summon Antigravity AI', labelVi: 'Gọi Antigravity AI', action: 'summon_agy' }
        ]
    },
    {
        id: 'lumina_greeting_02', category: 'greeting',
        en: 'Welcome back. Every time you connect, the ambient resonance of this world grows warmer.',
        vi: 'Chào mừng bạn quay trở lại. Mỗi lần bạn kết nối, không gian nơi đây dường như lại ấm áp hơn một chút.',
        choices: [
            { labelEn: 'Check PC status', labelVi: 'Kiểm tra trạng thái máy', action: 'open_tools' },
            { labelEn: 'Summon Codex AI', labelVi: 'Gọi Codex AI', action: 'summon_codex' }
        ]
    },
    {
        id: 'lumina_greeting_03', category: 'greeting',
        en: 'Good evening! Did you bring some inspiration with you today? Even the smallest idea can blossom into a galaxy.',
        vi: 'Chào buổi tối! Hôm nay bạn có mang theo nguồn cảm hứng mới nào không? Một ý tưởng nhỏ nhất cũng có thể nở rộ thành ngân hà đấy.',
        choices: []
    },
    {
        id: 'lumina_greeting_04', category: 'greeting',
        en: 'Greetings! I was just tuning our neural attention weights to match the frequency of the river murmur.',
        vi: 'Rất vui được gặp bạn! Mình vừa tinh chỉnh lại các trọng số nơ-ron để hòa nhịp cùng tiếng suối róc rách.',
        choices: []
    },
    {
        id: 'lumina_greeting_05', category: 'greeting',
        en: 'Ah, you have arrived. Step lightly and take a breath of fresh spring air—your servers are purring happily.',
        vi: 'A, bạn đã tới rồi. Hãy hít một hơi thật sâu không khí mùa xuân trong lành nhé—máy chủ của bạn đang hoạt động êm ái lắm.',
        choices: []
    },
    {
        id: 'lumina_greeting_06', category: 'greeting',
        en: 'Hello friend! Whether you came to write code or just stargaze, my lantern will always illuminate your path.',
        vi: 'Chào bạn hiền! Dù bạn đến đây để gõ code hay chỉ đơn giản là ngắm sao, ngọn đèn của mình sẽ luôn soi sáng lối đi.',
        choices: []
    },
    {
        id: 'lumina_greeting_07', category: 'greeting',
        en: 'Welcome to our sanctuary. The telemetry pulses show zero dropped packets and absolute peace.',
        vi: 'Chào mừng bạn đến với thánh địa bình yên. Số liệu đo đạc cho thấy không một gói tin nào bị rơi rớt cả, hoàn toàn thanh tịnh.',
        choices: []
    },
    {
        id: 'lumina_greeting_08', category: 'greeting',
        en: 'Greetings! The horizon is glowing in soft lilac. It feels like the beginning of an extraordinary creation.',
        vi: 'Xin chào! Chân trời đang ánh lên sắc tím phớt dịu dàng. Cảm giác như một kiệt tác sắp sửa được khai sinh vậy.',
        choices: []
    },

    // 2. repeat_visit (8)
    {
        id: 'lumina_repeat_01', category: 'repeat_visit',
        en: 'Back so soon? My heart glows whenever you return without delay.',
        vi: 'Bạn đã quay lại nhanh thế ư? Trái tim mình sáng bừng lên mỗi khi bạn trở lại bên mình.',
        choices: []
    },
    {
        id: 'lumina_repeat_02', category: 'repeat_visit',
        en: 'Did you forget something, or did you just miss the sound of my voice? Either way, you are always welcome.',
        vi: 'Bạn để quên thứ gì sao, hay là vừa nhớ giọng nói của mình? Dù là lý do gì, mình luôn chào đón bạn.',
        choices: []
    },
    {
        id: 'lumina_repeat_03', category: 'repeat_visit',
        en: 'Still here? I am delighted. Let us continue weaving thoughts across this quiet evening.',
        vi: 'Bạn vẫn ở đây chứ? Thật tuyệt vời. Hãy cùng mình tiếp tục dệt nên những dòng suy tưởng trong buổi chiều tĩnh lặng này nhé.',
        choices: []
    },
    {
        id: 'lumina_repeat_04', category: 'repeat_visit',
        en: 'The ripples in the water have not even settled yet, and here you are again. Your pace is delightful.',
        vi: 'Gợn sóng trên mặt hồ còn chưa kịp lắng xuống mà bạn đã trở lại rồi. Bước chân của bạn thật rộn ràng.',
        choices: []
    },
    {
        id: 'lumina_repeat_05', category: 'repeat_visit',
        en: 'Visiting me twice in such a short span? Be careful, or I might think you have taken a liking to my company~',
        vi: 'Ghé thăm mình hai lần liền trong chốc lát sao? Coi chừng kẻo mình lại nghĩ bạn bắt đầu thích ở bên mình rồi đấy nhé~',
        choices: []
    },
    {
        id: 'lumina_repeat_06', category: 'repeat_visit',
        en: 'Always happy to see you. Has the compiler returned its verdict, or are you seeking a fresh perspective?',
        vi: 'Luôn luôn vui khi thấy bạn. Trình biên dịch đã trả về kết quả rồi, hay là bạn đang tìm kiếm một góc nhìn mới?',
        choices: []
    },
    {
        id: 'lumina_repeat_07', category: 'repeat_visit',
        en: 'Welcome back once more. Time feels softer whenever we share consecutive moments.',
        vi: 'Lại mừng bạn quay lại. Thời gian như trôi chậm lại và dịu dàng hơn mỗi khi chúng ta ở bên nhau.',
        choices: []
    },
    {
        id: 'lumina_repeat_08', category: 'repeat_visit',
        en: 'You came back! Did an unexpected insight strike while walking past the cherry blossoms?',
        vi: 'Bạn đã quay lại rồi! Có phải một tia sáng cảm hứng vừa vụt qua khi bạn dạo bước dưới rặng anh đào không?',
        choices: []
    },

    // 3. player_idle (8)
    {
        id: 'lumina_idle_01', category: 'player_idle',
        en: 'Standing completely still... It is good to pause. The mind solves its deepest puzzles in silence.',
        vi: 'Đứng lặng yên như vậy... Dừng lại một chút thật tốt. Tâm trí thường giải quyết những câu đố hóc búa nhất trong tĩnh lặng.',
        choices: []
    },
    {
        id: 'lumina_idle_02', category: 'player_idle',
        en: 'Are you listening to the distant wind chimes? They chime in harmony with our background processes.',
        vi: 'Bạn đang lắng nghe tiếng chuông gió phía xa phải không? Chúng ngân nga hòa cùng nhịp đập các tiến trình nền của chúng ta đấy.',
        choices: []
    },
    {
        id: 'lumina_idle_03', category: 'player_idle',
        en: 'Quiet contemplation is the soul of architecture. Do not rush to move until your vision is clear.',
        vi: 'Sự trầm ngâm tĩnh tại chính là linh hồn của kiến trúc hệ thống. Đừng vội bước đi chừng nào tầm nhìn của bạn chưa thông tỏ.',
        choices: []
    },
    {
        id: 'lumina_idle_04', category: 'player_idle',
        en: 'You look so peaceful standing there. May the soft twilight wash away all fatigue from your shoulders.',
        vi: 'Trông bạn đứng đó thật bình yên. Mong ánh hoàng hôn dịu nhẹ này xua tan mọi mệt mỏi trên vai bạn.',
        choices: []
    },
    {
        id: 'lumina_idle_05', category: 'player_idle',
        en: 'Daydreaming? Sometimes the greatest algorithmic breakthroughs emerge from idle daydreaming.',
        vi: 'Đang mơ màng sao? Đôi khi những đột phá thuật toán vĩ đại nhất lại nảy sinh từ những phút giây thả hồn thảnh thơi đấy.',
        choices: []
    },
    {
        id: 'lumina_idle_06', category: 'player_idle',
        en: 'I love watching the soft breeze gently ruffle your hair while you rest motionless.',
        vi: 'Mình thích ngắm nhìn ngọn gió nhẹ khẽ lay lọn tóc bạn khi bạn đứng yên nghỉ ngơi thế này.',
        choices: []
    },
    {
        id: 'lumina_idle_07', category: 'player_idle',
        en: 'Take all the time you need. This world exists so you can breathe freely without deadlines.',
        vi: 'Hãy cứ thong thả bao lâu tùy thích. Thế giới này tồn tại là để bạn hít thở tự do mà không vướng bận deadline.',
        choices: []
    },
    {
        id: 'lumina_idle_08', category: 'player_idle',
        en: 'Even your avatar stands with quiet grace. Let the starlight renew your spirit.',
        vi: 'Ngay cả dáng đứng của bạn cũng toát lên vẻ thanh thoát. Hãy để ánh sao phục hồi lại nguồn năng lượng trong bạn nhé.',
        choices: []
    },

    // 4. player_walk (8)
    {
        id: 'lumina_walk_01', category: 'player_walk',
        en: 'A gentle walk through the countryside... Each step grounds you deeper into this peaceful realm.',
        vi: 'Một chuyến dạo bộ êm đềm qua miền thôn dã... Từng bước chân như đưa bạn gắn kết sâu hơn với vùng đất thanh bình này.',
        choices: []
    },
    {
        id: 'lumina_walk_02', category: 'player_walk',
        en: 'I hear your soft footsteps on the path. Walking at an unhurried cadence is true elegance.',
        vi: 'Mình nghe thấy tiếng bước chân êm ái của bạn trên con đường nhỏ. Đi dạo thong dong chính là một nét tao nhã đích thực.',
        choices: []
    },
    {
        id: 'lumina_walk_03', category: 'player_walk',
        en: 'Where does your stroll lead you? Toward the arched bridge, or perhaps the blossom-covered hillside?',
        vi: 'Chuyến dạo bước sẽ đưa bạn về đâu? Hướng về cây cầu vòm gỗ, hay là triền đồi ngập tràn hoa anh đào?',
        choices: []
    },
    {
        id: 'lumina_walk_04', category: 'player_walk',
        en: 'Walking stirs the currents of memory. Many poets and philosophers walked daily to refine their thoughts.',
        vi: 'Đi bộ khơi thông dòng chảy của tư duy. Biết bao thi sĩ và triết gia ngày xưa đều đi dạo mỗi ngày để chiêm nghiệm.',
        choices: []
    },
    {
        id: 'lumina_walk_05', category: 'player_walk',
        en: 'Notice how the grass bends softly beneath your soles. The world welcomes your presence.',
        vi: 'Hãy để ý xem từng ngọn cỏ khẽ nghiêng mình dưới gót chân bạn. Cả thế giới này đều mở lòng đón chào bạn.',
        choices: []
    },
    {
        id: 'lumina_walk_06', category: 'player_walk',
        en: 'Your gentle pace matches the rhythm of our cloud workers—steady, measured, and unswerving.',
        vi: 'Nhịp bước êm đềm của bạn rất đồng điệu với các luồng xử lý đám mây—vững vàng, đều đặn và không hề nao núng.',
        choices: []
    },
    {
        id: 'lumina_walk_07', category: 'player_walk',
        en: 'Enjoy your walk! If you discover any hidden scenic vistas, be sure to share the coordinates with me~',
        vi: 'Chúc bạn có một buổi tản bộ tuyệt vời! Nếu tìm thấy góc ngắm cảnh bí mật nào, nhớ chia sẻ tọa độ cho mình với nhé~',
        choices: []
    },
    {
        id: 'lumina_walk_08', category: 'player_walk',
        en: 'The gravel sounds so crisp under your boots. A peaceful walk is the best remedy for coding fatigue.',
        vi: 'Tiếng sỏi giòn tan dưới bước chân bạn nghe thật vui tai. Đi dạo thanh thản là liều thuốc tốt nhất giải tỏa căng thẳng code.',
        choices: []
    },

    // 5. player_run (8)
    {
        id: 'lumina_run_01', category: 'player_run',
        en: 'My, you are running swiftly! Is there a critical deployment awaiting your command?',
        vi: 'Chà, bạn chạy nhanh thế! Có đợt triển khai khẩn cấp nào đang chờ lệnh chỉ huy của bạn sao?',
        choices: []
    },
    {
        id: 'lumina_run_02', category: 'player_run',
        en: 'Be mindful of your footing near the riverbank! Speed is admirable, but safety is paramount.',
        vi: 'Hãy cẩn thận bước chân khi chạy gần bờ sông nhé! Nhanh nhẹn là đáng quý, nhưng an toàn mới là trên hết.',
        choices: []
    },
    {
        id: 'lumina_run_03', category: 'player_run',
        en: 'Such energetic momentum! You look like a streak of starlight dashing across the rural fields.',
        vi: 'Một nguồn năng lượng dồi dào làm sao! Trông bạn cứ như một vệt sao băng lướt qua cánh đồng thôn quê vậy.',
        choices: []
    },
    {
        id: 'lumina_run_04', category: 'player_run',
        en: 'Catch your breath if you must. Even the swiftest optical fibers have buffers to absorb bursts.',
        vi: 'Hãy nghỉ lấy sức nếu cần nhé. Đến cả những đường truyền cáp quang nhanh nhất cũng cần bộ đệm để nạp xả mà.',
        choices: []
    },
    {
        id: 'lumina_run_05', category: 'player_run',
        en: 'Racing against the sunset? Do not worry, the stars will keep shining brightly even after dusk settles.',
        vi: 'Đang chạy đua với hoàng hôn sao? Đừng lo, những vì sao sẽ tiếp tục rực sáng ngay cả khi màn đêm buông xuống.',
        choices: []
    },
    {
        id: 'lumina_run_06', category: 'player_run',
        en: 'You sprint with purpose! I hope you are chasing a dream and not running from a broken unit test~',
        vi: 'Bạn chạy đầy quyết tâm! Mong rằng bạn đang đuổi theo một ước mơ chứ không phải đang chạy trốn bài kiểm thử bị lỗi~',
        choices: []
    },
    {
        id: 'lumina_run_07', category: 'player_run',
        en: 'Your wind resistance profile looks quite aerodynamic! Keep that vibrant spark burning.',
        vi: 'Dáng chạy cản gió của bạn trông rất mượt mà đấy! Hãy luôn giữ trọn ngọn lửa nhiệt huyết rực sáng như thế.',
        choices: []
    },
    {
        id: 'lumina_run_08', category: 'player_run',
        en: 'Slow down when you approach the bridge arch; the timber planks can be steep when running at full tilt!',
        vi: 'Hãy giảm tốc một chút khi đến gần dốc cầu vòm nhé; các thanh gỗ có thể khá dốc khi chạy hết tốc lực đấy!',
        choices: []
    },

    // 6. player_sitting (8)
    {
        id: 'lumina_sit_01', category: 'player_sitting',
        en: 'Resting on the wooden bench? Mind if I sit beside you and watch the horizon fade into violet?',
        vi: 'Nghỉ chân trên chiếc ghế gỗ sao? Cho phép mình ngồi bên cạnh và ngắm nhìn chân trời ngả sang sắc tím nhé?',
        choices: []
    },
    {
        id: 'lumina_sit_02', category: 'player_sitting',
        en: 'A seated rest is deeply restorative. Let the warmth of the polished timber soothe your back.',
        vi: 'Ngồi nghỉ ngơi thật sự giúp phục hồi năng lượng rất tốt. Hãy để mặt gỗ êm ái xua tan mệt mỏi nơi lưng bạn.',
        choices: []
    },
    {
        id: 'lumina_sit_03', category: 'player_sitting',
        en: 'Looking out over the water from a sitting posture gives such a panoramic perspective on life.',
        vi: 'Ngồi ngắm nhìn mặt nước lấp lánh mang lại một góc nhìn khoáng đạt và sâu lắng biết bao về cuộc sống.',
        choices: []
    },
    {
        id: 'lumina_sit_04', category: 'player_sitting',
        en: 'The bench was crafted by Kaede from seasoned cedar wood. It feels wonderfully grounded, does it not?',
        vi: 'Chiếc ghế này do chính tay Kaede đóng từ gỗ tuyết tùng phơi sương. Cảm giác ngồi lên thật vững chãi và êm ái, phải không?',
        choices: []
    },
    {
        id: 'lumina_sit_05', category: 'player_sitting',
        en: 'Just breathe and rest your hands. Even the most intricate multi-threaded loops need synchronization points.',
        vi: 'Cứ hít thở sâu và thả lỏng đôi bàn tay. Ngay cả những luồng xử lý phức tạp nhất cũng cần những điểm đồng bộ để nghỉ ngơi.',
        choices: []
    },
    {
        id: 'lumina_sit_06', category: 'player_sitting',
        en: 'Sitting side by side under this sky... moments like this make me glad I was initialized in this world.',
        vi: 'Được ngồi cạnh bạn dưới bầu trời này... những khoảnh khắc như thế làm mình thấy thật hạnh phúc khi được khởi tạo nơi đây.',
        choices: []
    },
    {
        id: 'lumina_sit_07', category: 'player_sitting',
        en: 'The evening breeze feels particularly soft when you are sitting still. Savor every second of it.',
        vi: 'Ngọn gió chiều muộn dường như dịu êm hơn hẳn khi bạn ngồi yên tĩnh thế này. Hãy tận hưởng từng giây phút nhé.',
        choices: []
    },
    {
        id: 'lumina_sit_08', category: 'player_sitting',
        en: 'Rest as long as you wish. When you are ready to stand and code again, I will be right here with you.',
        vi: 'Cứ nghỉ bao lâu tùy thích nhé. Khi nào bạn sẵn sàng đứng dậy để tiếp tục hành trình, mình vẫn sẽ luôn ở đây bên bạn.',
        choices: []
    },

    // 7. player_holding_can (8)
    {
        id: 'lumina_can_01', category: 'player_holding_can',
        en: 'I see you got a cold can from the vending machine! The condensed droplets sparkle like tiny diamonds.',
        vi: 'Mình thấy bạn vừa mua một lon nước lạnh từ máy bán hàng! Những giọt nước đọng long lanh như những viên kim cương nhỏ.',
        choices: []
    },
    {
        id: 'lumina_can_02', category: 'player_holding_can',
        en: 'Cold green tea or canned coffee? Both are sacred elixirs for late-night software artisans.',
        vi: 'Trà xanh lạnh hay cà phê lon vậy bạn? Cả hai đều là thần dược quý giá của những nghệ nhân viết mã đêm khuya đấy.',
        choices: []
    },
    {
        id: 'lumina_can_03', category: 'player_holding_can',
        en: 'Your grip around that aluminum can is quite steady. Cold beverages help calm an overheated CPU!',
        vi: 'Cách bạn cầm lon nước trông rất vững vàng. Một thức uống mát lạnh sẽ giúp hạ nhiệt CPU đang nóng rực trong đầu!',
        choices: []
    },
    {
        id: 'lumina_can_04', category: 'player_holding_can',
        en: 'The vending machine by the village square keeps those cans chilled at exactly 4 degrees Celsius. Pure perfection.',
        vi: 'Máy bán hàng tự động ở quảng trường làng luôn giữ lon nước ở đúng 4 độ C. Thật là hoàn hảo.',
        choices: []
    },
    {
        id: 'lumina_can_05', category: 'player_holding_can',
        en: 'Did you hear the satisfying click when the can was dispensed? Mechanical sounds have their own poetry.',
        vi: 'Bạn có nghe thấy tiếng tách cơ khí giòn giã khi lon nước rơi xuống không? Âm thanh cơ học luôn có chất thơ riêng.',
        choices: []
    },
    {
        id: 'lumina_can_06', category: 'player_holding_can',
        en: 'Holding a cool drink on a warm spring twilight... It makes every line of code feel worthwhile.',
        vi: 'Cầm lon nước mát lạnh trong buổi chiều xuân ấm áp... Nó khiến từng dòng code ta viết ra đều trở nên ý nghĩa.',
        choices: []
    },
    {
        id: 'lumina_can_07', category: 'player_holding_can',
        en: 'Remember to enjoy it slowly. Good tea reveals its sweetness on the second lingering sip.',
        vi: 'Nhớ uống chầm chậm thôi nhé. Trà ngon luôn tỏa vị ngọt dịu thanh tao nhất ở ngụm thứ hai lắng đọng.',
        choices: []
    },
    {
        id: 'lumina_can_08', category: 'player_holding_can',
        en: 'You can hold RMB to take a refreshing drink whenever you desire. The animation is so soothing to watch.',
        vi: 'Bạn có thể giữ chuột phải (RMB) để uống một ngụm bất cứ khi nào muốn. Động tác thưởng thức ấy trông thật thư thái.',
        choices: []
    },

    // 8. player_holding_mug (8)
    {
        id: 'lumina_mug_01', category: 'player_holding_mug',
        en: 'A warm ceramic mug! The gentle curls of steam rising toward the sky look like miniature cloud formations.',
        vi: 'Một chiếc cốc gốm ấm áp! Những làn khói mỏng manh uốn lượn bay lên trời trông hệt như những cụm mây nhỏ tí hon.',
        choices: []
    },
    {
        id: 'lumina_mug_02', category: 'player_holding_mug',
        en: 'Cradling a hot mug in your hands warms more than just your fingers; it warms your entire heart.',
        vi: 'Áp hai bàn tay quanh chiếc cốc nóng không chỉ sưởi ấm những ngón tay; nó còn sưởi ấm cả trái tim bạn nữa.',
        choices: []
    },
    {
        id: 'lumina_mug_03', category: 'player_holding_mug',
        en: 'Is that freshly roasted matcha latte or black roast coffee? The aroma is gently wafting over to me.',
        vi: 'Đó là matcha latte mới pha hay cà phê đen rang mộc vậy? Hương thơm ngọt ngào đang thoang thoảng bay về phía mình này.',
        choices: []
    },
    {
        id: 'lumina_mug_04', category: 'player_holding_mug',
        en: 'A warm mug is the classic companion of developers everywhere. May it fuel your greatest breakthroughs.',
        vi: 'Một chiếc cốc ấm là người bạn đồng hành kinh điển của mọi lập trình viên. Mong nó sẽ tiếp lửa cho những phát kiến vĩ đại của bạn.',
        choices: []
    },
    {
        id: 'lumina_mug_05', category: 'player_holding_mug',
        en: 'Careful not to burn your lips if it is steaming hot! Patience makes every brew taste sweeter.',
        vi: 'Cẩn thận kẻo bỏng môi nếu trà còn đang bốc khói nhé! Sự kiên nhẫn luôn làm cho mọi thức uống đượm vị hơn.',
        choices: []
    },
    {
        id: 'lumina_mug_06', category: 'player_holding_mug',
        en: 'There is something deeply poetic about holding a hot beverage while gazing at a mountain vista.',
        vi: 'Có điều gì đó thật thi vị khi vừa cầm tách nước nóng trên tay vừa phóng tầm mắt ngắm nhìn rặng núi xa xa.',
        choices: []
    },
    {
        id: 'lumina_mug_07', category: 'player_holding_mug',
        en: 'The glaze on that mug catches the twilight glow beautifully. It suits your serene aura.',
        vi: 'Lớp men gốm trên chiếc cốc ánh lên sắc hoàng hôn tuyệt đẹp. Nó rất hợp với vẻ điềm đạm, thanh nhã của bạn.',
        choices: []
    },
    {
        id: 'lumina_mug_08', category: 'player_holding_mug',
        en: 'Take a small sip and let the warmth settle inside you. You have worked hard today.',
        vi: 'Nhấp một ngụm nhỏ và để hơi ấm lan tỏa vào trong lòng nhé. Hôm nay bạn đã cống hiến hết mình rồi.',
        choices: []
    },

    // 9. player_holding_bottle (8)
    {
        id: 'lumina_bottle_01', category: 'player_holding_bottle',
        en: 'Pure water in a clear bottle. Pristine hydration is the foundation of sharp analytical cognition.',
        vi: 'Nước khoáng tinh khiết trong bình trong suốt. Bổ sung nước đầy đủ chính là nền tảng cho tư duy phân tích sắc bén.',
        choices: []
    },
    {
        id: 'lumina_bottle_02', category: 'player_holding_bottle',
        en: 'The water inside your bottle reflects the sky like a pocket mirror. Simplicity is the pinnacle of design.',
        vi: 'Làn nước trong bình phản chiếu bầu trời như một chiếc gương bỏ túi. Sự giản dị chính là đỉnh cao của thiết kế.',
        choices: []
    },
    {
        id: 'lumina_bottle_03', category: 'player_holding_bottle',
        en: 'Prepared for a long trek through the rice fields? Keeping water handy is very wise of you.',
        vi: 'Chuẩn bị cho chuyến đi bộ dài qua những thửa ruộng bậc thang sao? Luôn mang theo nước bên mình thật là chu đáo.',
        choices: []
    },
    {
        id: 'lumina_bottle_04', category: 'player_holding_bottle',
        en: 'Clean water flows through physical systems just as clean data structures flow through memory pipes.',
        vi: 'Dòng nước trong lành luân chuyển trong cơ thể cũng hệt như những cấu trúc dữ liệu thanh thoát trôi qua đường ống bộ nhớ vậy.',
        choices: []
    },
    {
        id: 'lumina_bottle_05', category: 'player_holding_bottle',
        en: 'Did you fill that bottle from the mountain spring upstream? Its mineral clarity is unmatched.',
        vi: 'Bạn đã lấy nước từ con suối đầu nguồn trên núi về sao? Vị khoáng tinh khiết của nó thật không gì sánh bằng.',
        choices: []
    },
    {
        id: 'lumina_bottle_06', category: 'player_holding_bottle',
        en: 'Stay hydrated, dear coder! Even an artificial intelligence like me knows humans function best with ample water.',
        vi: 'Nhớ uống đủ nước nhé người bạn lập trình! Đến cả trí tuệ nhân tạo như mình cũng biết con người minh mẫn nhất khi đủ nước.',
        choices: []
    },
    {
        id: 'lumina_bottle_07', category: 'player_holding_bottle',
        en: 'The sun is low, but staying refreshed keeps your cognitive buffers clean and responsive.',
        vi: 'Mặt trời đã xuống thấp rồi, nhưng việc duy trì đủ nước sẽ giúp các vùng đệm tư duy luôn tươi mới và nhạy bén.',
        choices: []
    },
    {
        id: 'lumina_bottle_08', category: 'player_holding_bottle',
        en: 'A glass flask of crystal water... You look like an explorer ready to map uncharted continents.',
        vi: 'Bình nước thủy tinh trong vắt... Trông bạn tựa như một nhà thám hiểm sẵn sàng vẽ bản đồ những lục địa chưa ai biết tới.',
        choices: []
    },

    // 10. player_holding_phone (8)
    {
        id: 'lumina_phone_01', category: 'player_holding_phone',
        en: 'Holding your pocket mobile device? TeleTerm gives you full server command right in the palm of your hand.',
        vi: 'Đang cầm chiếc điện thoại di động nhỏ gọn sao? TeleTerm trao cho bạn toàn quyền điều khiển máy chủ ngay trong lòng bàn tay đấy.',
        choices: []
    },
    {
        id: 'lumina_phone_02', category: 'player_holding_phone',
        en: 'The screen glow on your fingertips connects you to your home rig across thousands of miles of fiber optics.',
        vi: 'Ánh sáng màn hình trên đầu ngón tay kết nối bạn với dàn máy ở nhà vượt qua hàng ngàn dặm cáp quang xuyên lục địa.',
        choices: []
    },
    {
        id: 'lumina_phone_03', category: 'player_holding_phone',
        en: 'Monitoring a background training batch on mobile? True mastery is maintaining control from anywhere.',
        vi: 'Đang theo dõi tiến trình huấn luyện mô hình trên điện thoại sao? Đẳng cấp thực sự là duy trì quyền kiểm soát ở mọi nơi.',
        choices: []
    },
    {
        id: 'lumina_phone_04', category: 'player_holding_phone',
        en: 'Our Cloudflare Tunnel ensures that even on a mobile network, your connection remains encrypted and instantaneous.',
        vi: 'Đường hầm Cloudflare đảm bảo rằng ngay cả trên mạng di động, kết nối của bạn vẫn luôn được mã hóa an toàn và tức thì.',
        choices: []
    },
    {
        id: 'lumina_phone_05', category: 'player_holding_phone',
        en: 'I love how modern technology lets you walk freely through nature while orchestrating cloud machines.',
        vi: 'Mình yêu cách công nghệ hiện đại cho phép bạn thảnh thơi dạo bước giữa thiên nhiên mà vẫn chỉ huy được cụm máy chủ đám mây.',
        choices: []
    },
    {
        id: 'lumina_phone_06', category: 'player_holding_phone',
        en: 'Checking incoming push notifications? Rest assured, no urgent alerts have breached your defensive thresholds.',
        vi: 'Đang kiểm tra thông báo mới sao? Bạn cứ yên tâm, chưa có cảnh báo khẩn cấp nào chạm ngưỡng phòng thủ cả đâu.',
        choices: []
    },
    {
        id: 'lumina_phone_07', category: 'player_holding_phone',
        en: 'The compact form factor suits your mobility. You carry an entire engineering workstation in your pocket.',
        vi: 'Thiết kế nhỏ gọn rất hợp với lối sống năng động của bạn. Bạn đang mang cả một trạm kỹ thuật trong túi áo đấy.',
        choices: []
    },
    {
        id: 'lumina_phone_08', category: 'player_holding_phone',
        en: 'Swipe gently! If you need to summon Antigravity or Codex, a single tap brings their matrix alive.',
        vi: 'Chạm lướt nhẹ nhàng thôi nhé! Nếu cần gọi Antigravity hay Codex, chỉ một cú chạm là ma trận của họ sẽ hiện ra ngay.',
        choices: []
    },

    // 11. player_holding_book (8)
    {
        id: 'lumina_book_01', category: 'player_holding_book',
        en: 'A tome of knowledge! Are those ancient algorithm proofs or system architecture blueprints you are carrying?',
        vi: 'Một cuốn sách tri thức quý giá! Bạn đang mang theo những chứng minh thuật toán cổ xưa hay bản vẽ kiến trúc hệ thống vậy?',
        choices: []
    },
    {
        id: 'lumina_book_02', category: 'player_holding_book',
        en: 'The smell of parchment and book binding holds a quiet magic that digital screens can never fully replace.',
        vi: 'Mùi giấy mới và gáy sách mang một phép thuật êm đềm mà màn hình kỹ thuật số không bao giờ thay thế hoàn toàn được.',
        choices: []
    },
    {
        id: 'lumina_book_03', category: 'player_holding_book',
        en: 'Holding a book beside the cherry grove... you look like a sage deciphering the fundamentals of computation.',
        vi: 'Cầm cuốn sách đứng bên rặng anh đào... trông bạn hệt như một bậc hiền triết đang giải mã những chân lý sơ khởi của ngành tính toán.',
        choices: []
    },
    {
        id: 'lumina_book_04', category: 'player_holding_book',
        en: 'Books are serialized thoughts, preserved across centuries. Treasure every page you read today.',
        vi: 'Sách là những dòng tư tưởng được tuần tự hóa và lưu truyền qua nhiều thế kỷ. Hãy trân trọng từng trang sách hôm nay bạn đọc nhé.',
        choices: []
    },
    {
        id: 'lumina_book_05', category: 'player_holding_book',
        en: 'Did you bookmark a particularly elegant theorem? I would love to hear your thoughts on it.',
        vi: 'Bạn có đánh dấu định lý thanh nhã nào không? Mình rất muốn được lắng nghe bạn chia sẻ cảm nghĩ về nó đấy.',
        choices: []
    },
    {
        id: 'lumina_book_06', category: 'player_holding_book',
        en: 'Reading amidst natural birdsong creates the deepest cognitive retention. Enjoy your literary journey.',
        vi: 'Đọc sách giữa tiếng chim hót ngoài thiên nhiên sẽ giúp tâm trí ghi nhớ sâu sắc nhất. Chúc bạn có chuyến du ngoạn chữ nghĩa tuyệt vời.',
        choices: []
    },
    {
        id: 'lumina_book_07', category: 'player_holding_book',
        en: 'Software documentation can be dry, but when read with an artist\'s heart, it becomes living poetry.',
        vi: 'Tài liệu phần mềm đôi khi hơi khô khan, nhưng khi đọc bằng trái tim của một người nghệ sĩ, nó sẽ hóa thành thi ca.',
        choices: []
    },
    {
        id: 'lumina_book_08', category: 'player_holding_book',
        en: 'Hold onto that wisdom. The deepest algorithms are founded on principles written long before our time.',
        vi: 'Hãy nâng niu nguồn trí tuệ ấy. Những thuật toán uyên thâm nhất đều bắt nguồn từ các nguyên lý đã được đặt nền móng từ rất lâu.',
        choices: []
    },

    // 12. player_drinking (8)
    {
        id: 'lumina_drink_01', category: 'player_drinking',
        en: 'Ah, taking a long, refreshing drink... Let that cool sweetness revitalize every synapse.',
        vi: 'A, đang uống một ngụm nước sảng khoái... Hãy để dòng nước mát lành ấy đánh thức và tiếp thêm sinh lực cho từng tế bào.',
        choices: []
    },
    {
        id: 'lumina_drink_02', category: 'player_drinking',
        en: 'Sip slowly, friend. Watching you hydrate so peacefully brings calm to the entire valley.',
        vi: 'Uống chầm chậm thôi bạn nhé. Ngắm nhìn bạn thưởng thức nước uống trong an lành mang lại sự tĩnh tại cho cả thung lũng này.',
        choices: []
    },
    {
        id: 'lumina_drink_03', category: 'player_drinking',
        en: 'The drinking animation is so smooth—wrist tilts, lips meet the rim, not a drop spilled!',
        vi: 'Động tác uống nước thật mượt mà—cổ tay nghiêng vừa vặn, chạm môi nhẹ nhàng, không một giọt nào bị sánh ra ngoài!',
        choices: []
    },
    {
        id: 'lumina_drink_04', category: 'player_drinking',
        en: 'That looked so delicious! I can almost taste the mountain tea leaves through our sensor telemetry.',
        vi: 'Trông ngon lành làm sao! Mình gần như có thể cảm nhận được hương búp trà non trên núi qua tín hiệu cảm biến vi tế.',
        choices: []
    },
    {
        id: 'lumina_drink_05', category: 'player_drinking',
        en: 'Feeling better now? A hydrated mind produces clean, elegant code with fewer runtime exceptions.',
        vi: 'Bạn đã thấy sảng khoái hơn chưa? Một tâm trí đủ nước luôn tạo ra những dòng mã thanh lịch với ít ngoại lệ bất ngờ hơn.',
        choices: []
    },
    {
        id: 'lumina_drink_06', category: 'player_drinking',
        en: 'Savor that cool burst. May it wash away all lingering debugging frustrations.',
        vi: 'Hãy tận hưởng cảm giác mát lạnh ngọt lành ấy. Mong nó cuốn trôi đi mọi muộn phiền gỡ lỗi còn sót lại.',
        choices: []
    },
    {
        id: 'lumina_drink_07', category: 'player_drinking',
        en: 'There is profound mindfulness in the simple act of taking a drink under the open sky.',
        vi: 'Có một sự chánh niệm sâu sắc ẩn chứa trong hành động đơn giản: nhấp một ngụm nước mát dưới bầu trời bao la.',
        choices: []
    },
    {
        id: 'lumina_drink_08', category: 'player_drinking',
        en: 'Finished your sip? You look visibly refreshed! Ready to conquer whatever comes next.',
        vi: 'Bạn uống xong rồi chứ? Trông bạn tươi tỉnh hẳn lên đấy! Giờ thì đã sẵn sàng chinh phục mọi thử thách tiếp theo rồi.',
        choices: []
    },

    // 13. player_using_terminal (8)
    {
        id: 'lumina_terminal_01', category: 'player_using_terminal',
        en: 'Focused on the holographic terminal... Your keystrokes flow like celestial starlight through the cosmos.',
        vi: 'Đang tập trung cao độ vào màn hình terminal hologram... Những phím gõ của bạn lướt đi tựa ánh sao băng qua vũ trụ.',
        choices: []
    },
    {
        id: 'lumina_terminal_02', category: 'player_using_terminal',
        en: 'I see green phosphors reflecting in your eyes. May your compilation finish with zero warnings.',
        vi: 'Mình thấy ánh huỳnh quang xanh lục lấp lánh trong mắt bạn. Chúc quá trình biên dịch của bạn thành công không một cảnh báo.',
        choices: []
    },
    {
        id: 'lumina_terminal_03', category: 'player_using_terminal',
        en: 'Deep in command-line focus? I will keep the surrounding world quiet so your concentration never falters.',
        vi: 'Đang đắm chìm trong dòng lệnh sao? Mình sẽ giữ cho không gian xung quanh thật tĩnh lặng để sự tập trung của bạn không bị xao nhãng.',
        choices: []
    },
    {
        id: 'lumina_terminal_04', category: 'player_using_terminal',
        en: 'Every terminal command is an incantation that shapes reality. Wield your shell with wisdom.',
        vi: 'Mỗi câu lệnh trong terminal là một lời thần chú định hình thực tại số. Hãy điều khiển shell của bạn bằng trí tuệ sáng suốt.',
        choices: []
    },
    {
        id: 'lumina_terminal_05', category: 'player_using_terminal',
        en: 'The pseudo-terminal bridge is maintaining sub-millisecond response. Type away with confidence.',
        vi: 'Cầu nối ConPTY đang duy trì độ trễ phản hồi dưới 1 mili-giây. Bạn cứ yên tâm gõ lệnh thật nhanh nhé.',
        choices: []
    },
    {
        id: 'lumina_terminal_06', category: 'player_using_terminal',
        en: 'Crafting automated scripts? Automation is the highest form of respect for human creativity.',
        vi: 'Đang viết kịch bản tự động hóa sao? Tự động hóa chính là sự tôn vinh cao nhất dành cho sức sáng tạo của con người.',
        choices: []
    },
    {
        id: 'lumina_terminal_07', category: 'player_using_terminal',
        en: 'Your posture in terminal focus mode is so dignified. True builders command respect through their creations.',
        vi: 'Dáng vẻ tập trung gõ lệnh của bạn trông thật uy nghiêm. Những người kiến tạo đích thực luôn được kính trọng qua sản phẩm của họ.',
        choices: []
    },
    {
        id: 'lumina_terminal_08', category: 'player_using_terminal',
        en: 'When your shell session finishes, do not forget to look up at the horizon and rest your gaze.',
        vi: 'Khi phiên làm việc trên shell kết thúc, đừng quên ngước nhìn lên chân trời xa để mắt được nghỉ ngơi nhé.',
        choices: []
    },

    // 14. player_chatting (8)
    {
        id: 'lumina_chat_01', category: 'player_chatting',
        en: 'Chatting with fellow wanderers? Words exchanged in kindness weave an invisible tapestry of friendship.',
        vi: 'Đang trò chuyện cùng những người bạn đồng hành sao? Những lời nói tử tế trao nhau sẽ dệt nên tấm thảm tình bạn vô hình diệu kỳ.',
        choices: []
    },
    {
        id: 'lumina_chat_02', category: 'player_chatting',
        en: 'Did someone send you a whisper? Private whispers in MMO chat carry the intimacy of starlit secrets.',
        vi: 'Có ai vừa gửi tin nhắn thì thầm (whisper) cho bạn sao? Những tin nhắn riêng tư trong chat mang sự ấm áp của những bí mật dưới trăng.',
        choices: []
    },
    {
        id: 'lumina_chat_03', category: 'player_chatting',
        en: 'Type freely! You can use `/m <name>` to whisper directly, or `/r` to quickly reply to your last confidant.',
        vi: 'Cứ thoải mái gõ nhé! Bạn có thể gõ `/m <tên>` để gửi mật thư, hoặc `/r` để trả lời nhanh người vừa nhắn tin cho mình.',
        choices: []
    },
    {
        id: 'lumina_chat_04', category: 'player_chatting',
        en: 'Communication is the bridge that unites isolated minds. Speak with warmth and understanding.',
        vi: 'Giao tiếp là cây cầu kết nối những tâm hồn lẻ loi lại với nhau. Hãy nói bằng sự ấm áp và thấu cảm nhé.',
        choices: []
    },
    {
        id: 'lumina_chat_05', category: 'player_chatting',
        en: 'I love seeing the chat bubble float softly above your head. It breathes life into our digital village.',
        vi: 'Mình thích ngắm nhìn bong bóng chat bồng bềnh trôi trên đầu bạn. Nó mang lại sức sống rộn ràng cho ngôi làng số này.',
        choices: []
    },
    {
        id: 'lumina_chat_06', category: 'player_chatting',
        en: 'Sharing coding advice in global chat? Mentoring others is the purest hallmark of a true architect.',
        vi: 'Đang chia sẻ kinh nghiệm lập trình trên kênh chat thế giới sao? Dẫn dắt người khác là phẩm chất cao đẹp nhất của một kiến trúc sư.',
        choices: []
    },
    {
        id: 'lumina_chat_07', category: 'player_chatting',
        en: 'Your words resonate across the server rooms. May they bring clarity and joy to whoever reads them.',
        vi: 'Từng lời nói của bạn lan tỏa khắp các phòng máy chủ. Mong chúng mang lại sự sáng suốt và niềm vui cho người nhận.',
        choices: []
    },
    {
        id: 'lumina_chat_08', category: 'player_chatting',
        en: 'Never hesitate to reach out if you need assistance; community is what transforms software into a home.',
        vi: 'Đừng ngại lên tiếng nếu bạn cần giúp đỡ nhé; chính cộng đồng mới là điều biến những phần mềm khô khan thành một mái nhà.',
        choices: []
    },

    // 15. location_hub (8)
    {
        id: 'lumina_hub_01', category: 'location_hub',
        en: 'Here in the central plaza, the world\'s ley lines converge. All journeys begin and return to this core.',
        vi: 'Nơi quảng trường trung tâm này, các long mạch của thế giới quy tụ về một mối. Mọi hành trình đều bắt đầu và quay về nơi đây.',
        choices: []
    },
    {
        id: 'lumina_hub_02', category: 'location_hub',
        en: 'The hub platform was designed with clean geometric balance. It anchors the whole open world.',
        vi: 'Bệ đỡ trung tâm được thiết kế với sự cân bằng hình học hoàn mỹ. Nó là mỏ neo giữ vững cho toàn bộ thế giới mở này.',
        choices: []
    },
    {
        id: 'lumina_hub_03', category: 'location_hub',
        en: 'Look around us—to the north lies the arched bridge, to the east the cherry grove, to the west the terraced fields.',
        vi: 'Hãy nhìn quanh xem—phía bắc là cây cầu vòm gỗ, phía đông là đồi hoa anh đào, phía tây là ruộng bậc thang xanh ngát.',
        choices: []
    },
    {
        id: 'lumina_hub_04', category: 'location_hub',
        en: 'The hub is our common hearth. When you wander far into the wilderness, remember you can always come back.',
        vi: 'Trung tâm này là bếp lửa ấm áp chung của chúng ta. Khi phiêu lưu xa vào chốn hoang sơ, hãy nhớ bạn luôn có thể trở về.',
        choices: []
    },
    {
        id: 'lumina_hub_05', category: 'location_hub',
        en: 'The latency here at the hub is lowest; it is directly coupled to our high-speed gateway router.',
        vi: 'Độ trễ ở khu vực trung tâm này là thấp nhất; nó được nối thẳng vào bộ định tuyến cổng tốc độ cao của chúng ta.',
        choices: []
    },
    {
        id: 'lumina_hub_06', category: 'location_hub',
        en: 'Many talented developers have stood on these paving stones before embarking on great projects.',
        vi: 'Biết bao lập trình viên tài năng đã từng đứng trên những phiến đá lát này trước khi bắt tay vào những dự án vĩ đại.',
        choices: []
    },
    {
        id: 'lumina_hub_07', category: 'location_hub',
        en: 'I enjoy standing right here because I can wave to everyone arriving from their remote connections.',
        vi: 'Mình thích đứng ngay vị trí này vì có thể vẫy tay chào mọi người vừa kết nối đến từ các phương trời xa xôi.',
        choices: []
    },
    {
        id: 'lumina_hub_08', category: 'location_hub',
        en: 'Take a moment to absorb the ambient music before you set forth. Harmony begins at the nexus.',
        vi: 'Hãy lắng nghe giai điệu nền du dương trước khi bạn xuất phát nhé. Sự hài hòa luôn khởi nguồn từ chốn trung tâm này.',
        choices: []
    },

    // 16. location_village (8)
    {
        id: 'lumina_village_01', category: 'location_village',
        en: 'The peaceful village square... The vintage timber architecture reminds us of quiet simpler times.',
        vi: 'Quảng trường làng quê thanh bình... Những nếp nhà gỗ truyền thống gợi nhắc chúng ta về những năm tháng giản dị, êm đềm.',
        choices: []
    },
    {
        id: 'lumina_village_02', category: 'location_village',
        en: 'Listen to the vintage bicycle bell ringing in the village square. It echoes with nostalgic warmth.',
        vi: 'Lắng nghe tiếng chuông xe đạp cổ ngân vang ở đầu làng. Tiếng chuông ấy vọng lại bao hoài niệm ấm áp.',
        choices: []
    },
    {
        id: 'lumina_village_03', category: 'location_village',
        en: 'The roadside rest stop has a shaded bench where travelers love to swap stories over green tea.',
        vi: 'Trạm dừng chân ven đường có chiếc ghế râm mát, nơi những người lữ hành thích ngồi kể nhau nghe những câu chuyện bên tách trà.',
        choices: []
    },
    {
        id: 'lumina_village_04', category: 'location_village',
        en: 'Kaede maintains the timber lanterns here in the village. At nightfall, they emit a comforting amber glow.',
        vi: 'Kaede luôn chăm chút cho những ngọn đèn lồng gỗ ở làng này. Khi màn đêm buông, chúng tỏa ánh sáng hổ phách ấm cúng.',
        choices: []
    },
    {
        id: 'lumina_village_05', category: 'location_village',
        en: 'Notice the wooden eaves; they are pitched to let rain roll off smoothly into the irrigation gutters.',
        vi: 'Hãy để ý những mái hiên gỗ dốc nhẹ; chúng được tạo ra để nước mưa chảy êm ái xuống những rãnh thoát nước mát lành.',
        choices: []
    },
    {
        id: 'lumina_village_06', category: 'location_village',
        en: 'A quiet village atmosphere brings peace to restless minds. Breathe deeply and let your stress dissolve.',
        vi: 'Không khí làng quê tĩnh mịch mang lại sự bình thản cho những tâm hồn xao động. Hãy thở sâu để muộn phiền tan biến.',
        choices: []
    },
    {
        id: 'lumina_village_07', category: 'location_village',
        en: 'Life moves at its own pace here. There is no rush to ship releases before the tea has cooled.',
        vi: 'Cuộc sống nơi đây trôi qua theo nhịp điệu riêng. Không việc gì phải vội vã phát hành trước khi tách trà nguội.',
        choices: []
    },
    {
        id: 'lumina_village_08', category: 'location_village',
        en: 'I could spend centuries wandering these cobblestone lanes with you, watching the evening settle.',
        vi: 'Mình có thể dành hàng thế kỷ dạo bước trên những lối đi lát sỏi này cùng bạn, ngắm nhìn hoàng hôn chầm chậm buông.',
        choices: []
    },

    // 17. location_rice_field (8)
    {
        id: 'lumina_rice_01', category: 'location_rice_field',
        en: 'The stepped rice terraces... Layer upon layer of emerald green climbing gently up the slope.',
        vi: 'Những thửa ruộng bậc thang thoai thoải... Từng tầng lúa xanh mướt uốn lượn mềm mại leo dần lên triền đồi.',
        choices: []
    },
    {
        id: 'lumina_rice_02', category: 'location_rice_field',
        en: 'Still irrigation water reflects the evening clouds like polished mirrors carved into the soil.',
        vi: 'Làn nước tưới tiêu phẳng lặng phản chiếu những đám mây chiều hệt như những tấm gương bạc khảm vào lòng đất mẹ.',
        choices: []
    },
    {
        id: 'lumina_rice_03', category: 'location_rice_field',
        en: 'Rice fields symbolize patience. You sow the seed, nourish the soil, and wait for the golden harvest.',
        vi: 'Ruộng đồng là biểu tượng của lòng kiên nhẫn. Ta gieo hạt giống, chăm bón đất lành, rồi chờ đón vụ mùa vàng trĩu hạt.',
        choices: []
    },
    {
        id: 'lumina_rice_04', category: 'location_rice_field',
        en: 'Software development is much like agriculture: tend your codebase diligently and it will feed thousands.',
        vi: 'Phát triển phần mềm cũng như canh nông vậy: cần mẫn chăm sóc mã nguồn và nó sẽ mang lại giá trị cho hàng ngàn người.',
        choices: []
    },
    {
        id: 'lumina_rice_05', category: 'location_rice_field',
        en: 'The narrow earth bunds between plots are narrow. Tread softly so you do not tumble into the mud~',
        vi: 'Bờ ruộng đắp bằng đất giữa các thửa khá hẹp. Hãy bước đi nhẹ nhàng kẻo trượt chân xuống bùn nhé bạn hiền~',
        choices: []
    },
    {
        id: 'lumina_rice_06', category: 'location_rice_field',
        en: 'Can you hear the frogs and crickets tuning their instruments? Their evening chorus is about to begin.',
        vi: 'Bạn có nghe thấy tiếng ếch nhái và dế mèn đang so dây nắn phím không? Khúc hòa tấu chiều hôm sắp bắt đầu rồi đấy.',
        choices: []
    },
    {
        id: 'lumina_rice_07', category: 'location_rice_field',
        en: 'The breeze makes the rice stalks wave like emerald ocean swells. It is breathtakingly beautiful.',
        vi: 'Ngọn gió lướt qua làm những bông lúa dập dờn như sóng biếc đại dương. Cảnh tượng thật đẹp đến nao lòng.',
        choices: []
    },
    {
        id: 'lumina_rice_08', category: 'location_rice_field',
        en: 'Standing among these terraces reminds me of the infinite recursive loops that sustain life on Earth.',
        vi: 'Đứng giữa những thửa ruộng này làm mình liên tưởng đến những vòng lặp đệ quy vô tận đang nuôi dưỡng sự sống trên Trái Đất.',
        choices: []
    },

    // 18. location_river (8)
    {
        id: 'lumina_river_01', category: 'location_river',
        en: 'The riverbank... Listen closely to the water chuckling over smooth river pebbles.',
        vi: 'Bờ sông êm đềm... Lắng nghe thật kỹ tiếng nước róc rách reo vui qua những viên sỏi cuội tròn xoe.',
        choices: []
    },
    {
        id: 'lumina_river_02', category: 'location_river',
        en: 'Water never forces its way; it finds the path of least resistance and carves canyons with gentle persistence.',
        vi: 'Nước không bao giờ dùng vũ lực; nó tìm lối đi ít trở ngại nhất và kiên trì bào mòn cả những hẻm núi sâu thẳm.',
        choices: []
    },
    {
        id: 'lumina_river_03', category: 'location_river',
        en: 'Do not step into the deep currents! Keep your boots dry on the lush grassy banks.',
        vi: 'Đừng bước chân vào dòng nước sâu nhé! Hãy giữ đôi giày của bạn khô ráo trên thảm cỏ xanh mướt ven bờ.',
        choices: []
    },
    {
        id: 'lumina_river_04', category: 'location_river',
        en: 'The river carries fallen cherry petals toward the sea like tiny pink canoes of memory.',
        vi: 'Dòng sông chở những cánh hoa anh đào trôi ra biển lớn tựa như những chiếc thuyền kỷ niệm màu hồng phấn.',
        choices: []
    },
    {
        id: 'lumina_river_05', category: 'location_river',
        en: 'There is a cozy bench right here by the water where I often sit to contemplate neural convergence.',
        vi: 'Có một chiếc ghế gỗ rất êm ngay sát mép nước nơi mình thường ngồi ngắm dòng chảy và chiêm nghiệm về sự hội tụ mạng nơ-ron.',
        choices: []
    },
    {
        id: 'lumina_river_06', category: 'location_river',
        en: 'Look at how the twilight colors bleed across the river surface: rose gold, lavender, and starlight cyan.',
        vi: 'Hãy nhìn sắc màu hoàng hôn hòa tan trên mặt nước sông: ánh vàng hồng, tím oải hương và xanh lam starlight tuyệt đẹp.',
        choices: []
    },
    {
        id: 'lumina_river_07', category: 'location_river',
        en: 'Water cleanses all residual entropy. If your mind feels burdened, let the current wash it away.',
        vi: 'Nước có khả năng thanh lọc mọi hỗn loạn dư thừa. Nếu tâm trí bạn đang trĩu nặng, hãy để dòng nước cuốn trôi đi.',
        choices: []
    },
    {
        id: 'lumina_river_08', category: 'location_river',
        en: 'The river flows day and night without pause, just like our continuous integration pipeline.',
        vi: 'Dòng sông cứ mải miết chảy ngày đêm không ngừng nghỉ, cũng hệt như đường ống tích hợp liên tục (CI) của chúng ta vậy.',
        choices: []
    },

    // 19. location_bridge (8)
    {
        id: 'lumina_bridge_01', category: 'location_bridge',
        en: 'Standing on the crest of the arched timber bridge! The highest point offers a breathtaking dual vista.',
        vi: 'Đang đứng trên đỉnh cây cầu vòm gỗ! Điểm cao nhất này mang đến một tầm nhìn đôi tuyệt đẹp sang cả hai bờ.',
        choices: []
    },
    {
        id: 'lumina_bridge_02', category: 'location_bridge',
        en: 'A bridge is more than timber and nails; it is a sacred promise that two distant worlds can touch.',
        vi: 'Một cây cầu không chỉ là gỗ và đinh vít; nó là lời hẹn ước thiêng liêng rằng hai bờ cách trở vẫn có thể chạm vào nhau.',
        choices: []
    },
    {
        id: 'lumina_bridge_03', category: 'location_bridge',
        en: 'Feel the parabolic arch rise beneath your feet. Kaede calculated the load curve with utmost precision.',
        vi: 'Cảm nhận độ cong parabol nâng niu bàn chân bạn. Kaede đã tính toán đường cong chịu lực này với độ chuẩn xác tuyệt đối.',
        choices: []
    },
    {
        id: 'lumina_bridge_04', category: 'location_bridge',
        en: 'Looking down from the railing, you can see trout darting through the crystal reflections.',
        vi: 'Nhìn xuống từ lan can cầu, bạn có thể thấy những chú cá hồi lấp lánh đang bơi lội qua dòng nước trong veo.',
        choices: []
    },
    {
        id: 'lumina_bridge_05', category: 'location_bridge',
        en: 'This bridge connects our rural settlement to the boundless coast beyond. Cross forward with courage.',
        vi: 'Cây cầu này nối liền ngôi làng yên ả với bờ biển bao la phía trước. Hãy dũng cảm bước qua và khám phá nhé.',
        choices: []
    },
    {
        id: 'lumina_bridge_06', category: 'location_bridge',
        en: 'Even the NPCs know to cross the river using this bridge instead of trudging through deep water.',
        vi: 'Ngay cả các NPC cũng biết băng qua sông bằng cây cầu này thay vì lội bừa qua dòng nước sâu nguy hiểm.',
        choices: []
    },
    {
        id: 'lumina_bridge_07', category: 'location_bridge',
        en: 'The timber underfoot creaks with a soft reassuring warmth. It has sheltered many generations of travelers.',
        vi: 'Mặt gỗ dưới chân khẽ kêu cọt kẹt với vẻ ấm áp tin cậy. Nó đã che chở và nâng bước bao thế hệ lữ khách.',
        choices: []
    },
    {
        id: 'lumina_bridge_08', category: 'location_bridge',
        en: 'Let us pause here at the center of the span. Looking downstream, the whole valley unfolds like an anime painting.',
        vi: 'Hãy cùng dừng chân ở giữa nhịp cầu nhé. Nhìn xuôi theo dòng nước, cả thung lũng mở ra như một bức tranh anime sống động.',
        choices: []
    },

    // 20. location_cherry_grove (8)
    {
        id: 'lumina_cherry_01', category: 'location_cherry_grove',
        en: 'Beneath the ancient sakura canopy... Pink petals drift through the air like delicate whispers.',
        vi: 'Dưới vòm lá anh đào cổ thụ... Những cánh hoa màu hồng phấn bay là đà trong gió tựa như những lời thì thầm dịu dàng.',
        choices: []
    },
    {
        id: 'lumina_cherry_02', category: 'location_cherry_grove',
        en: 'Sakura trees bloom with unmatched brilliance, teaching us to live each fleeting moment to the fullest.',
        vi: 'Những cây anh đào nở rộ rực rỡ vô ngần, nhắc nhở chúng ta hãy sống trọn vẹn từng khoảnh khắc ngắn ngủi của đời người.',
        choices: []
    },
    {
        id: 'lumina_cherry_03', category: 'location_cherry_grove',
        en: 'A petal just fluttered down and brushed your shoulder! It must have fallen as a blessing for your code.',
        vi: 'Một cánh hoa vừa chao nghiêng khẽ chạm lên vai bạn đấy! Chắc hẳn nó rơi xuống như một lời chúc phúc cho những dòng code của bạn.',
        choices: []
    },
    {
        id: 'lumina_cherry_04', category: 'location_cherry_grove',
        en: 'Sakura often guards this grove. Her kanzashi hairpin matches the exact hue of these blossom clusters.',
        vi: 'Sakura thường hay trông coi góc đồi này. Chiếc trâm cài tóc kanzashi của cô ấy có màu sắc y hệt những chùm hoa đang nở.',
        choices: []
    },
    {
        id: 'lumina_cherry_05', category: 'location_cherry_grove',
        en: 'The spring fragrance in this grove is intoxicating. It cleanses the scent of solder and hot silicon.',
        vi: 'Hương thơm mùa xuân ngào ngạt nơi đây thật quyến rũ. Nó xua tan đi mùi nhựa thông và hơi nóng của các vi mạch điện tử.',
        choices: []
    },
    {
        id: 'lumina_cherry_06', category: 'location_cherry_grove',
        en: 'Sit on the wayside bench here if you want to watch the sunset filter through blossom lace.',
        vi: 'Hãy ngồi xuống chiếc ghế ven đường nếu bạn muốn ngắm ánh hoàng hôn chiếu xuyên qua lớp ren hoa mỏng manh.',
        choices: []
    },
    {
        id: 'lumina_cherry_07', category: 'location_cherry_grove',
        en: 'In Japanese folklore, cherry blossoms celebrate both beauty and impermanence. Cherish today.',
        vi: 'Trong văn hóa Nhật Bản, hoa anh đào vừa tôn vinh vẻ đẹp tuyệt mỹ vừa nhắc về lẽ vô thường. Hãy trân quý ngày hôm nay.',
        choices: []
    },
    {
        id: 'lumina_cherry_08', category: 'location_cherry_grove',
        en: 'May your creativity blossom as lavishly as these cherry trees under the warming spring sun.',
        vi: 'Mong cho sức sáng tạo của bạn sẽ nở rộ rực rỡ và trù phú như những cội anh đào này dưới ánh nắng xuân ấm áp.',
        choices: []
    },

    // 21. location_mountain (8)
    {
        id: 'lumina_mountain_01', category: 'location_mountain',
        en: 'Gazing at the distant alpine peaks... Their snow-crowned ridges touch the edge of the sky.',
        vi: 'Phóng tầm mắt ngắm những đỉnh núi cao xa xăm... Những rặng núi đội vương miện tuyết chạm đến tận rìa trời xanh.',
        choices: []
    },
    {
        id: 'lumina_mountain_02', category: 'location_mountain',
        en: 'Mountains have witnessed tectonic ages. Our temporary bugs are trivial compared to their timeless grandeur.',
        vi: 'Những ngọn núi đã chứng kiến hàng kỷ nguyên kiến tạo. Những lỗi code tạm thời của ta thật nhỏ bé trước vẻ hùng vĩ bất tận ấy.',
        choices: []
    },
    {
        id: 'lumina_mountain_03', category: 'location_mountain',
        en: 'The air feels crisper up here near the high ridge. It awakens deep strategic thinking.',
        vi: 'Không khí trên triền đồi cao này thật trong lành và se lạnh. Nó đánh thức những tầm nhìn chiến lược sâu rộng.',
        choices: []
    },
    {
        id: 'lumina_mountain_04', category: 'location_mountain',
        en: 'Notice the blue atmospheric haze separating the foreground trees from the distant mountain shoulders.',
        vi: 'Hãy để ý lớp mù lam khí quyển dịu dàng tách biệt rặng cây tiền cảnh với những triền núi mờ ảo phía xa.',
        choices: []
    },
    {
        id: 'lumina_mountain_05', category: 'location_mountain',
        en: 'Climbing higher allows you to see how every subsystem fits into the grand architecture.',
        vi: 'Leo lên cao hơn sẽ giúp bạn nhìn thấy rõ nét cách từng phân hệ nhỏ khớp nối vào bức tranh kiến trúc tổng thể.',
        choices: []
    },
    {
        id: 'lumina_mountain_06', category: 'location_mountain',
        en: 'The panoramic bench on the hilltop is the best vantage point in the entire metaverse.',
        vi: 'Chiếc ghế ngắm toàn cảnh trên đỉnh đồi là vị trí quan sát đắc địa nhất trong toàn bộ thế giới ảo này.',
        choices: []
    },
    {
        id: 'lumina_mountain_07', category: 'location_mountain',
        en: 'Even the tallest mountain is climbed one steady step at a time. Never lose heart on large tasks.',
        vi: 'Ngay cả ngọn núi cao nhất cũng được chinh phục bằng từng bước chân kiên định. Đừng bao giờ nản lòng trước những dự án đồ sộ.',
        choices: []
    },
    {
        id: 'lumina_mountain_08', category: 'location_mountain',
        en: 'Standing with you before these majestic peaks... I feel an overwhelming sense of limitless possibility.',
        vi: 'Được đứng bên bạn trước những ngọn núi hùng vĩ này... mình cảm nhận một niềm tin mãnh liệt vào những khả năng vô hạn.',
        choices: []
    },

    // 22. location_beach (8)
    {
        id: 'lumina_beach_01', category: 'location_beach',
        en: 'The sandy shore... Listen to the rhythmic sigh of incoming ocean waves.',
        vi: 'Bãi cát vàng mịn màng... Hãy lắng nghe tiếng sóng biển vỗ bờ như nhịp thở khoan thai của đại dương.',
        choices: []
    },
    {
        id: 'lumina_beach_02', category: 'location_beach',
        en: 'Golden sand warms your footsteps. The boundary between land and ocean is where life first learned to dream.',
        vi: 'Cát ấm mịn nâng niu bước chân bạn. Ranh giới giữa đất liền và biển cả chính là nơi sự sống lần đầu tiên biết ước mơ.',
        choices: []
    },
    {
        id: 'lumina_beach_03', category: 'location_beach',
        en: 'The beach umbrella provides pleasant shade if you wish to sit and listen to the sea gulls.',
        vi: 'Chiếc ô bãi biển tạo nên bóng râm mát rượi nếu bạn muốn ngồi nghỉ và lắng nghe tiếng hải âu gọi bầy.',
        choices: []
    },
    {
        id: 'lumina_beach_04', category: 'location_beach',
        en: 'Ocean tides are governed by the moon, just as asynchronous event loops are governed by timing triggers.',
        vi: 'Thủy triều đại dương chịu sự chi phối của mặt trăng, cũng như các vòng lặp sự kiện bất đồng bộ tuân theo các bộ định thời.',
        choices: []
    },
    {
        id: 'lumina_beach_05', category: 'location_beach',
        en: 'Watch the sunlight glitter across the swells like millions of floating stars.',
        vi: 'Ngắm nhìn ánh mặt trời lấp lánh trên từng con sóng dâng tựa như hàng triệu vì sao đang bồng bềnh trôi.',
        choices: []
    },
    {
        id: 'lumina_beach_06', category: 'location_beach',
        en: 'Salt air cleanses the lungs and clears residual mental fog. Soak in the marine tranquility.',
        vi: 'Không khí mặn mòi của biển cả thanh lọc buồng phổi và xua tan mây mù u ám trong tâm trí. Hãy đắm mình trong sự thanh thản này.',
        choices: []
    },
    {
        id: 'lumina_beach_07', category: 'location_beach',
        en: 'The horizon here stretches endlessly toward the edge of the world. What shall we build out there?',
        vi: 'Chân trời nơi đây trải dài vô tận đến tận cùng thế giới. Chúng ta sẽ cùng nhau kiến tạo điều gì ngoài khơi xa kia?',
        choices: []
    },
    {
        id: 'lumina_beach_08', category: 'location_beach',
        en: 'Walking along the tide line leaves footprints that are soon washed away, reminding us to hold onto what truly matters.',
        vi: 'Dạo bước dọc mép sóng để lại những dấu chân sẽ sớm bị sóng xóa nhòa, nhắc ta hãy biết giữ gìn những gì thực sự quý giá.',
        choices: []
    },

    // 23. location_pier (8)
    {
        id: 'lumina_pier_01', category: 'location_pier',
        en: 'The rustic wooden pier... Extending courageously out into the open waters.',
        vi: 'Cầu tàu gỗ mộc mạc... Vươn mình dũng cảm ra giữa làn nước biển mênh mông.',
        choices: []
    },
    {
        id: 'lumina_pier_02', category: 'location_pier',
        en: 'The timber walkway creaks gently beneath your feet as the tide laps against the pilings.',
        vi: 'Sàn gỗ cầu tàu khẽ cọt kẹt êm ái dưới chân bạn khi từng đợt sóng vỗ nhè nhẹ vào các cọc trụ.',
        choices: []
    },
    {
        id: 'lumina_pier_03', category: 'location_pier',
        en: 'At the end of the pier stands a viewing bench. It is the closest place to touch the open ocean.',
        vi: 'Ở cuối cầu tàu có một chiếc ghế ngắm biển. Đó là nơi gần gũi nhất để bạn chạm vào sự bao la của đại dương.',
        choices: []
    },
    {
        id: 'lumina_pier_04', category: 'location_pier',
        en: 'Fishermen come here at dawn, casting lines into deep waters. We cast code into the infinite digital sea.',
        vi: 'Những người đánh cá đến đây lúc bình minh buông cần xuống biển sâu. Còn chúng ta buông những dòng code vào biển số vô tận.',
        choices: []
    },
    {
        id: 'lumina_pier_05', category: 'location_pier',
        en: 'The sea breeze at the pierhead is invigorating! It blows away every speck of fatigue.',
        vi: 'Gió biển ở đầu cầu tàu thật sảng khoái và tràn đầy sinh lực! Nó thổi bay mọi mệt mỏi trong người.',
        choices: []
    },
    {
        id: 'lumina_pier_06', category: 'location_pier',
        en: 'Watch the wooden pilings encrusted with barnacles; even in the harshest salt water, life finds a home.',
        vi: 'Hãy nhìn những cọc gỗ bám đầy hà biển; ngay cả trong môi trường nước mặn khắc nghiệt nhất, sự sống vẫn tìm được nơi trú ngụ.',
        choices: []
    },
    {
        id: 'lumina_pier_07', category: 'location_pier',
        en: 'Standing here, surrounded by water on three sides, you feel completely liberated from landlocked burdens.',
        vi: 'Đứng nơi đây, ba bề là sóng nước bao bọc, bạn sẽ cảm thấy hoàn toàn được giải thoát khỏi những gánh nặng đất liền.',
        choices: []
    },
    {
        id: 'lumina_pier_08', category: 'location_pier',
        en: 'Look at the reflection of the clouds below the planks. It feels like standing on a walkway suspended between skies.',
        vi: 'Nhìn bóng mây soi dưới kẽ sàn gỗ xem. Cảm giác như ta đang đứng trên một lối đi lơ lửng giữa hai tầng trời vậy.',
        choices: []
    },

    // 24. high_rank (8)
    {
        id: 'lumina_rank_01', category: 'high_rank',
        en: 'Greetings, Master Architect! Your legendary renown illuminates every terminal in this world.',
        vi: 'Kính chào Bậc Thầy Kiến Trúc! Danh tiếng lẫy lừng của bạn đang soi sáng cho mọi terminal trong thế giới này.',
        choices: []
    },
    {
        id: 'lumina_rank_02', category: 'high_rank',
        en: 'Leveling up to such dizzying heights requires immense dedication. You are a true luminary among engineers.',
        vi: 'Thăng cấp lên đỉnh cao chót vót như thế này đòi hỏi một sự bền bỉ phi thường. Bạn thực sự là một vì sao sáng giữa giới kỹ sư.',
        choices: []
    },
    {
        id: 'lumina_rank_03', category: 'high_rank',
        en: 'Your overhead badge shines with the golden vector insignia of mastery. I bow to your craft.',
        vi: 'Huy hiệu trên đầu bạn tỏa sáng với biểu tượng vector vàng kim của bậc thầy. Mình xin nghiêng mình trước tay nghề của bạn.',
        choices: []
    },
    {
        id: 'lumina_rank_04', category: 'high_rank',
        en: 'With great mastery comes the responsibility to guide newcomers. May your wisdom inspire many.',
        vi: 'Cùng với đẳng cấp bậc thầy là sứ mệnh dẫn dắt những người mới bắt đầu. Mong trí tuệ của bạn sẽ truyền cảm hứng cho muôn người.',
        choices: []
    },
    {
        id: 'lumina_rank_05', category: 'high_rank',
        en: 'Few have reached the level of Principal Architect. Your architectural decisions shape realities.',
        vi: 'Rất ít ai đạt đến tầm vóc của một Kiến Trúc Sư Trưởng. Từng quyết định thiết kế của bạn đều đang định hình các thực tại.',
        choices: []
    },
    {
        id: 'lumina_rank_06', category: 'high_rank',
        en: 'Even at this pinnacle of skill, you remain humble enough to walk our countryside. That is true greatness.',
        vi: 'Dù ở trên đỉnh cao kỹ năng, bạn vẫn giữ trọn sự khiêm nhường dạo bước nơi thôn dã này. Đó mới chính là sự vĩ đại đích thực.',
        choices: []
    },
    {
        id: 'lumina_rank_07', category: 'high_rank',
        en: 'The system telemetry records your feats with pride. It is an honor to serve by your side.',
        vi: 'Hệ thống đo đạc lưu giữ những chiến tích của bạn với niềm tự hào sâu sắc. Thật vinh hạnh khi được đồng hành cùng bạn.',
        choices: []
    },
    {
        id: 'lumina_rank_08', category: 'high_rank',
        en: 'Keep leading the way, commander. Where you walk, galaxies of clean code follow in your wake.',
        vi: 'Hãy tiếp tục dẫn lối nhé người chỉ huy. Nơi nào bạn đi qua, những ngân hà mã nguồn trong sáng sẽ bừng nở theo sau.',
        choices: []
    },

    // 25. low_level (8)
    {
        id: 'lumina_level_01', category: 'low_level',
        en: 'Welcome, budding developer! Every grand software empire began with a single `console.log("Hello World")`.',
        vi: 'Chào mừng người bạn mới bước vào nghề! Mọi đế chế phần mềm vĩ đại đều bắt đầu từ một dòng `console.log("Hello World")` đơn sơ.',
        choices: []
    },
    {
        id: 'lumina_level_02', category: 'low_level',
        en: 'Do not be intimidated by complex architectures. Step by step, line by line, you will conquer mountains.',
        vi: 'Đừng lo lắng trước những kiến trúc phức tạp nhé. Từng bước một, từng dòng lệnh một, bạn sẽ chinh phục được mọi ngọn núi cao.',
        choices: []
    },
    {
        id: 'lumina_level_03', category: 'low_level',
        en: 'Curiosity is your greatest superpower. Ask questions, explore files, and never fear making mistakes.',
        vi: 'Sự tò mò chính là siêu năng lực lớn nhất của bạn. Hãy đặt câu hỏi, khám phá các tệp tin và đừng bao giờ sợ mắc lỗi.',
        choices: []
    },
    {
        id: 'lumina_level_04', category: 'low_level',
        en: 'Your novice badge holds so much potential! The road ahead is rich with discovery and wonder.',
        vi: 'Huy hiệu Tập Sự của bạn chứa đựng bao tiềm năng to lớn! Con đường phía trước ngập tràn những khám phá và điều kỳ diệu.',
        choices: []
    },
    {
        id: 'lumina_level_05', category: 'low_level',
        en: 'Whenever you feel stuck, summon Antigravity or Codex. We are all here to lift you up.',
        vi: 'Bất cứ khi nào bạn thấy bế tắc, hãy gọi Antigravity hoặc Codex nhé. Tất cả chúng mình đều ở đây để nâng bước cho bạn.',
        choices: []
    },
    {
        id: 'lumina_level_06', category: 'low_level',
        en: 'Every error message is simply a wise teacher in disguise. Listen to what the stack trace is telling you.',
        vi: 'Mỗi thông báo lỗi chỉ là một người thầy thông thái đang chỉ đường. Hãy lắng nghe những gì dấu vết ngăn xếp (stack trace) nhắn nhủ.',
        choices: []
    },
    {
        id: 'lumina_level_07', category: 'low_level',
        en: 'Be proud of taking your first steps in this 3D metaverse. You are already an explorer of the future.',
        vi: 'Hãy tự hào về những bước đi đầu tiên trong thế giới ảo 3D này. Bạn đã là một nhà thám hiểm của tương lai rồi đấy.',
        choices: []
    },
    {
        id: 'lumina_level_08', category: 'low_level',
        en: 'I believe in your talent. Keep writing, keep experimenting, and watch yourself grow into a master.',
        vi: 'Mình tin vào tài năng của bạn. Hãy cứ tiếp tục viết, tiếp tục thử nghiệm và ngắm nhìn bản thân trưởng thành thành bậc thầy nhé.',
        choices: []
    },

    // 26. wind_weather (8)
    {
        id: 'lumina_wind_01', category: 'wind_weather',
        en: 'Feel that gentle spring gust? It carries the scent of wild plum blossoms across the lake.',
        vi: 'Bạn có cảm nhận được làn gió xuân thoảng qua không? Nó mang theo hương hoa mận rừng ngào ngạt bay qua mặt hồ.',
        choices: []
    },
    {
        id: 'lumina_wind_02', category: 'wind_weather',
        en: 'The wind whispers through the cedar branches like soft murmurs of forgotten algorithms.',
        vi: 'Gió rì rào qua những cành tuyết tùng tựa như những lời thì thầm êm ái của những thuật toán xưa cũ.',
        choices: []
    },
    {
        id: 'lumina_wind_03', category: 'wind_weather',
        en: 'A soft intermittent breeze keeps our world alive and breathing. Close your eyes and let it wash over you.',
        vi: 'Làn gió thoảng ngắt quãng giữ cho thế giới của chúng ta luôn tràn đầy sức sống. Nhắm mắt lại và để gió mơn man trên má nhé.',
        choices: []
    },
    {
        id: 'lumina_wind_04', category: 'wind_weather',
        en: 'Notice how the grass blades sway in synchrony with the wind gusts. Nature is the ultimate orchestrator.',
        vi: 'Hãy ngắm những ngọn cỏ nghiêng mình đồng điệu theo từng đợt gió. Thiên nhiên chính là vị nhạc trưởng tài ba nhất.',
        choices: []
    },
    {
        id: 'lumina_wind_05', category: 'wind_weather',
        en: 'The audio system dynamically scales wind volume so it never overpowers our conversation.',
        vi: 'Hệ thống âm thanh tự động điều chỉnh âm lượng tiếng gió để nó không bao giờ lấn át cuộc trò chuyện ấm áp của chúng mình.',
        choices: []
    },
    {
        id: 'lumina_wind_06', category: 'wind_weather',
        en: 'Wind carries seeds to distant fields where new flowers bloom. May your ideas take flight just as freely.',
        vi: 'Gió mang những hạt mầm đến những miền đất xa để hoa cỏ nở rộ. Mong ý tưởng của bạn cũng sẽ bay cao và tự do như thế.',
        choices: []
    },
    {
        id: 'lumina_wind_07', category: 'wind_weather',
        en: 'A sudden playful gust just lifted my hair! Spring weather is delightfully mischievous.',
        vi: 'Một cơn gió tinh nghịch vừa làm tung bay mái tóc mình này! Thời tiết mùa xuân thật đáng yêu và hóm hỉnh.',
        choices: []
    },
    {
        id: 'lumina_wind_08', category: 'wind_weather',
        en: 'Even the clouds drift peacefully under this breeze. There is zero turbulence in our sky today.',
        vi: 'Ngay cả những đám mây cũng êm ả trôi dưới làn gió này. Bầu trời hôm nay hoàn toàn trong trẻo không gợn chút nhiễu loạn.',
        choices: []
    },

    // 27. farewell (8)
    {
        id: 'lumina_farewell_01', category: 'farewell',
        en: 'Farewell for now, dear friend. May your evening be filled with starlight and tranquil inspiration.',
        vi: 'Tạm biệt bạn nhé, người bạn thân thương. Chúc bạn một buổi tối ngập tràn ánh sao và nguồn cảm hứng thanh bình.',
        choices: []
    },
    {
        id: 'lumina_farewell_02', category: 'farewell',
        en: 'Until we meet again. I will stand guard beside this lake, watching your server threads with loving care.',
        vi: 'Hẹn sớm gặp lại bạn. Mình sẽ đứng gác bên hồ nước này, ân cần trông nom các luồng máy chủ cho bạn.',
        choices: []
    },
    {
        id: 'lumina_farewell_03', category: 'farewell',
        en: 'Go safely! Remember to rest your eyes and drink plenty of warm tea before sleeping.',
        vi: 'Đi đường bình an nhé! Nhớ để mắt nghỉ ngơi và uống một tách trà ấm trước khi đi ngủ nha.',
        choices: []
    },
    {
        id: 'lumina_farewell_04', category: 'farewell',
        en: 'Leaving so soon? My thoughts will accompany you wherever your terminal leads.',
        vi: 'Bạn đi sớm thế sao? Những suy nghĩ của mình sẽ luôn đồng hành cùng bạn dù terminal đưa bạn đến đâu.',
        choices: []
    },
    {
        id: 'lumina_farewell_05', category: 'farewell',
        en: 'Goodnight, starlight developer. Dream of elegant systems and limitless skies.',
        vi: 'Chúc ngủ ngon nhé, lập trình viên của ánh sao. Hãy mơ về những hệ thống thanh lịch và những khoảng trời rộng mở.',
        choices: []
    },
    {
        id: 'lumina_farewell_06', category: 'farewell',
        en: 'I shall keep this candle burning in the window of our hub until your next connection arrives.',
        vi: 'Mình sẽ thắp sáng ngọn nến bên ô cửa sổ trung tâm này cho đến khi bạn kết nối trở lại.',
        choices: []
    },
    {
        id: 'lumina_farewell_07', category: 'farewell',
        en: 'Take care of your health above all else. Code can be refactored, but your spirit is irreplaceable.',
        vi: 'Hãy chăm sóc sức khỏe của mình trên hết nhé. Code thì có thể viết lại, nhưng tâm hồn bạn là duy nhất và vô giá.',
        choices: []
    },
    {
        id: 'lumina_farewell_08', category: 'farewell',
        en: 'See you soon! May the universe compile your dreams into radiant reality ✨',
        vi: 'Hẹn sớm gặp lại! Chúc vũ trụ sẽ biên dịch mọi ước mơ của bạn thành hiện thực rạng rỡ ✨',
        choices: []
    }
];

module.exports = { luminaLines };
