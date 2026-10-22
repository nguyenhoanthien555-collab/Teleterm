/**
 * TELETERM 3D — MASTER NPC DIALOGUE REPOSITORY
 * 4 Rich Anime Characters (Lumina, Sakura, Ren, Kaede)
 * Total: 864 Authored Lines (>= 200 lines per NPC)
 * Strict bilingual parity (EN and VI) across 27 Context Categories.
 */

export const DIALOGUE_CATEGORIES = [
    "greeting",
    "repeat_visit",
    "player_idle",
    "player_walk",
    "player_run",
    "player_sitting",
    "player_holding_can",
    "player_holding_mug",
    "player_holding_bottle",
    "player_holding_phone",
    "player_holding_book",
    "player_drinking",
    "player_using_terminal",
    "player_chatting",
    "location_hub",
    "location_village",
    "location_rice_field",
    "location_river",
    "location_bridge",
    "location_cherry_grove",
    "location_mountain",
    "location_beach",
    "location_pier",
    "high_rank",
    "low_level",
    "wind_weather",
    "farewell"
];

export const NPC_DIALOGUE_DATABASE = {
    lumina: [
    {
        "id": "lumina_greeting_01",
        "category": "greeting",
        "en": "Hello, traveler of starlight. The evening sky is tranquil today. Shall we watch the data streams flow together?",
        "vi": "Xin chào người lữ hành dưới ánh sao. Bầu trời hoàng hôn hôm nay thật bình yên. Chúng ta cùng ngắm nhìn dòng dữ liệu êm đềm trôi nhé?",
        "choices": [
            {
                "labelEn": "Summon Terminal",
                "labelVi": "Triệu hồi Terminal",
                "action": "summon_term"
            },
            {
                "labelEn": "Summon Antigravity AI",
                "labelVi": "Gọi Antigravity AI",
                "action": "summon_agy"
            }
        ]
    },
    {
        "id": "lumina_greeting_02",
        "category": "greeting",
        "en": "Welcome back. Every time you connect, the ambient resonance of this world grows warmer.",
        "vi": "Chào mừng bạn quay trở lại. Mỗi lần bạn kết nối, không gian nơi đây dường như lại ấm áp hơn một chút.",
        "choices": [
            {
                "labelEn": "Check PC status",
                "labelVi": "Kiểm tra trạng thái máy",
                "action": "open_tools"
            },
            {
                "labelEn": "Summon Codex AI",
                "labelVi": "Gọi Codex AI",
                "action": "summon_codex"
            }
        ]
    },
    {
        "id": "lumina_greeting_03",
        "category": "greeting",
        "en": "Good evening! Did you bring some inspiration with you today? Even the smallest idea can blossom into a galaxy.",
        "vi": "Chào buổi tối! Hôm nay bạn có mang theo nguồn cảm hứng mới nào không? Một ý tưởng nhỏ nhất cũng có thể nở rộ thành ngân hà đấy.",
        "choices": []
    },
    {
        "id": "lumina_greeting_04",
        "category": "greeting",
        "en": "Greetings! I was just tuning our neural attention weights to match the frequency of the river murmur.",
        "vi": "Rất vui được gặp bạn! Mình vừa tinh chỉnh lại các trọng số nơ-ron để hòa nhịp cùng tiếng suối róc rách.",
        "choices": []
    },
    {
        "id": "lumina_greeting_05",
        "category": "greeting",
        "en": "Ah, you have arrived. Step lightly and take a breath of fresh spring air—your servers are purring happily.",
        "vi": "A, bạn đã tới rồi. Hãy hít một hơi thật sâu không khí mùa xuân trong lành nhé—máy chủ của bạn đang hoạt động êm ái lắm.",
        "choices": []
    },
    {
        "id": "lumina_greeting_06",
        "category": "greeting",
        "en": "Hello friend! Whether you came to write code or just stargaze, my lantern will always illuminate your path.",
        "vi": "Chào bạn hiền! Dù bạn đến đây để gõ code hay chỉ đơn giản là ngắm sao, ngọn đèn của mình sẽ luôn soi sáng lối đi.",
        "choices": []
    },
    {
        "id": "lumina_greeting_07",
        "category": "greeting",
        "en": "Welcome to our sanctuary. The telemetry pulses show zero dropped packets and absolute peace.",
        "vi": "Chào mừng bạn đến với thánh địa bình yên. Số liệu đo đạc cho thấy không một gói tin nào bị rơi rớt cả, hoàn toàn thanh tịnh.",
        "choices": []
    },
    {
        "id": "lumina_greeting_08",
        "category": "greeting",
        "en": "Greetings! The horizon is glowing in soft lilac. It feels like the beginning of an extraordinary creation.",
        "vi": "Xin chào! Chân trời đang ánh lên sắc tím phớt dịu dàng. Cảm giác như một kiệt tác sắp sửa được khai sinh vậy.",
        "choices": []
    },
    {
        "id": "lumina_repeat_01",
        "category": "repeat_visit",
        "en": "Back so soon? My heart glows whenever you return without delay.",
        "vi": "Bạn đã quay lại nhanh thế ư? Trái tim mình sáng bừng lên mỗi khi bạn trở lại bên mình.",
        "choices": []
    },
    {
        "id": "lumina_repeat_02",
        "category": "repeat_visit",
        "en": "Did you forget something, or did you just miss the sound of my voice? Either way, you are always welcome.",
        "vi": "Bạn để quên thứ gì sao, hay là vừa nhớ giọng nói của mình? Dù là lý do gì, mình luôn chào đón bạn.",
        "choices": []
    },
    {
        "id": "lumina_repeat_03",
        "category": "repeat_visit",
        "en": "Still here? I am delighted. Let us continue weaving thoughts across this quiet evening.",
        "vi": "Bạn vẫn ở đây chứ? Thật tuyệt vời. Hãy cùng mình tiếp tục dệt nên những dòng suy tưởng trong buổi chiều tĩnh lặng này nhé.",
        "choices": []
    },
    {
        "id": "lumina_repeat_04",
        "category": "repeat_visit",
        "en": "The ripples in the water have not even settled yet, and here you are again. Your pace is delightful.",
        "vi": "Gợn sóng trên mặt hồ còn chưa kịp lắng xuống mà bạn đã trở lại rồi. Bước chân của bạn thật rộn ràng.",
        "choices": []
    },
    {
        "id": "lumina_repeat_05",
        "category": "repeat_visit",
        "en": "Visiting me twice in such a short span? Be careful, or I might think you have taken a liking to my company~",
        "vi": "Ghé thăm mình hai lần liền trong chốc lát sao? Coi chừng kẻo mình lại nghĩ bạn bắt đầu thích ở bên mình rồi đấy nhé~",
        "choices": []
    },
    {
        "id": "lumina_repeat_06",
        "category": "repeat_visit",
        "en": "Always happy to see you. Has the compiler returned its verdict, or are you seeking a fresh perspective?",
        "vi": "Luôn luôn vui khi thấy bạn. Trình biên dịch đã trả về kết quả rồi, hay là bạn đang tìm kiếm một góc nhìn mới?",
        "choices": []
    },
    {
        "id": "lumina_repeat_07",
        "category": "repeat_visit",
        "en": "Welcome back once more. Time feels softer whenever we share consecutive moments.",
        "vi": "Lại mừng bạn quay lại. Thời gian như trôi chậm lại và dịu dàng hơn mỗi khi chúng ta ở bên nhau.",
        "choices": []
    },
    {
        "id": "lumina_repeat_08",
        "category": "repeat_visit",
        "en": "You came back! Did an unexpected insight strike while walking past the cherry blossoms?",
        "vi": "Bạn đã quay lại rồi! Có phải một tia sáng cảm hứng vừa vụt qua khi bạn dạo bước dưới rặng anh đào không?",
        "choices": []
    },
    {
        "id": "lumina_idle_01",
        "category": "player_idle",
        "en": "Standing completely still... It is good to pause. The mind solves its deepest puzzles in silence.",
        "vi": "Đứng lặng yên như vậy... Dừng lại một chút thật tốt. Tâm trí thường giải quyết những câu đố hóc búa nhất trong tĩnh lặng.",
        "choices": []
    },
    {
        "id": "lumina_idle_02",
        "category": "player_idle",
        "en": "Are you listening to the distant wind chimes? They chime in harmony with our background processes.",
        "vi": "Bạn đang lắng nghe tiếng chuông gió phía xa phải không? Chúng ngân nga hòa cùng nhịp đập các tiến trình nền của chúng ta đấy.",
        "choices": []
    },
    {
        "id": "lumina_idle_03",
        "category": "player_idle",
        "en": "Quiet contemplation is the soul of architecture. Do not rush to move until your vision is clear.",
        "vi": "Sự trầm ngâm tĩnh tại chính là linh hồn của kiến trúc hệ thống. Đừng vội bước đi chừng nào tầm nhìn của bạn chưa thông tỏ.",
        "choices": []
    },
    {
        "id": "lumina_idle_04",
        "category": "player_idle",
        "en": "You look so peaceful standing there. May the soft twilight wash away all fatigue from your shoulders.",
        "vi": "Trông bạn đứng đó thật bình yên. Mong ánh hoàng hôn dịu nhẹ này xua tan mọi mệt mỏi trên vai bạn.",
        "choices": []
    },
    {
        "id": "lumina_idle_05",
        "category": "player_idle",
        "en": "Daydreaming? Sometimes the greatest algorithmic breakthroughs emerge from idle daydreaming.",
        "vi": "Đang mơ màng sao? Đôi khi những đột phá thuật toán vĩ đại nhất lại nảy sinh từ những phút giây thả hồn thảnh thơi đấy.",
        "choices": []
    },
    {
        "id": "lumina_idle_06",
        "category": "player_idle",
        "en": "I love watching the soft breeze gently ruffle your hair while you rest motionless.",
        "vi": "Mình thích ngắm nhìn ngọn gió nhẹ khẽ lay lọn tóc bạn khi bạn đứng yên nghỉ ngơi thế này.",
        "choices": []
    },
    {
        "id": "lumina_idle_07",
        "category": "player_idle",
        "en": "Take all the time you need. This world exists so you can breathe freely without deadlines.",
        "vi": "Hãy cứ thong thả bao lâu tùy thích. Thế giới này tồn tại là để bạn hít thở tự do mà không vướng bận deadline.",
        "choices": []
    },
    {
        "id": "lumina_idle_08",
        "category": "player_idle",
        "en": "Even your avatar stands with quiet grace. Let the starlight renew your spirit.",
        "vi": "Ngay cả dáng đứng của bạn cũng toát lên vẻ thanh thoát. Hãy để ánh sao phục hồi lại nguồn năng lượng trong bạn nhé.",
        "choices": []
    },
    {
        "id": "lumina_walk_01",
        "category": "player_walk",
        "en": "A gentle walk through the countryside... Each step grounds you deeper into this peaceful realm.",
        "vi": "Một chuyến dạo bộ êm đềm qua miền thôn dã... Từng bước chân như đưa bạn gắn kết sâu hơn với vùng đất thanh bình này.",
        "choices": []
    },
    {
        "id": "lumina_walk_02",
        "category": "player_walk",
        "en": "I hear your soft footsteps on the path. Walking at an unhurried cadence is true elegance.",
        "vi": "Mình nghe thấy tiếng bước chân êm ái của bạn trên con đường nhỏ. Đi dạo thong dong chính là một nét tao nhã đích thực.",
        "choices": []
    },
    {
        "id": "lumina_walk_03",
        "category": "player_walk",
        "en": "Where does your stroll lead you? Toward the arched bridge, or perhaps the blossom-covered hillside?",
        "vi": "Chuyến dạo bước sẽ đưa bạn về đâu? Hướng về cây cầu vòm gỗ, hay là triền đồi ngập tràn hoa anh đào?",
        "choices": []
    },
    {
        "id": "lumina_walk_04",
        "category": "player_walk",
        "en": "Walking stirs the currents of memory. Many poets and philosophers walked daily to refine their thoughts.",
        "vi": "Đi bộ khơi thông dòng chảy của tư duy. Biết bao thi sĩ và triết gia ngày xưa đều đi dạo mỗi ngày để chiêm nghiệm.",
        "choices": []
    },
    {
        "id": "lumina_walk_05",
        "category": "player_walk",
        "en": "Notice how the grass bends softly beneath your soles. The world welcomes your presence.",
        "vi": "Hãy để ý xem từng ngọn cỏ khẽ nghiêng mình dưới gót chân bạn. Cả thế giới này đều mở lòng đón chào bạn.",
        "choices": []
    },
    {
        "id": "lumina_walk_06",
        "category": "player_walk",
        "en": "Your gentle pace matches the rhythm of our cloud workers—steady, measured, and unswerving.",
        "vi": "Nhịp bước êm đềm của bạn rất đồng điệu với các luồng xử lý đám mây—vững vàng, đều đặn và không hề nao núng.",
        "choices": []
    },
    {
        "id": "lumina_walk_07",
        "category": "player_walk",
        "en": "Enjoy your walk! If you discover any hidden scenic vistas, be sure to share the coordinates with me~",
        "vi": "Chúc bạn có một buổi tản bộ tuyệt vời! Nếu tìm thấy góc ngắm cảnh bí mật nào, nhớ chia sẻ tọa độ cho mình với nhé~",
        "choices": []
    },
    {
        "id": "lumina_walk_08",
        "category": "player_walk",
        "en": "The gravel sounds so crisp under your boots. A peaceful walk is the best remedy for coding fatigue.",
        "vi": "Tiếng sỏi giòn tan dưới bước chân bạn nghe thật vui tai. Đi dạo thanh thản là liều thuốc tốt nhất giải tỏa căng thẳng code.",
        "choices": []
    },
    {
        "id": "lumina_run_01",
        "category": "player_run",
        "en": "My, you are running swiftly! Is there a critical deployment awaiting your command?",
        "vi": "Chà, bạn chạy nhanh thế! Có đợt triển khai khẩn cấp nào đang chờ lệnh chỉ huy của bạn sao?",
        "choices": []
    },
    {
        "id": "lumina_run_02",
        "category": "player_run",
        "en": "Be mindful of your footing near the riverbank! Speed is admirable, but safety is paramount.",
        "vi": "Hãy cẩn thận bước chân khi chạy gần bờ sông nhé! Nhanh nhẹn là đáng quý, nhưng an toàn mới là trên hết.",
        "choices": []
    },
    {
        "id": "lumina_run_03",
        "category": "player_run",
        "en": "Such energetic momentum! You look like a streak of starlight dashing across the rural fields.",
        "vi": "Một nguồn năng lượng dồi dào làm sao! Trông bạn cứ như một vệt sao băng lướt qua cánh đồng thôn quê vậy.",
        "choices": []
    },
    {
        "id": "lumina_run_04",
        "category": "player_run",
        "en": "Catch your breath if you must. Even the swiftest optical fibers have buffers to absorb bursts.",
        "vi": "Hãy nghỉ lấy sức nếu cần nhé. Đến cả những đường truyền cáp quang nhanh nhất cũng cần bộ đệm để nạp xả mà.",
        "choices": []
    },
    {
        "id": "lumina_run_05",
        "category": "player_run",
        "en": "Racing against the sunset? Do not worry, the stars will keep shining brightly even after dusk settles.",
        "vi": "Đang chạy đua với hoàng hôn sao? Đừng lo, những vì sao sẽ tiếp tục rực sáng ngay cả khi màn đêm buông xuống.",
        "choices": []
    },
    {
        "id": "lumina_run_06",
        "category": "player_run",
        "en": "You sprint with purpose! I hope you are chasing a dream and not running from a broken unit test~",
        "vi": "Bạn chạy đầy quyết tâm! Mong rằng bạn đang đuổi theo một ước mơ chứ không phải đang chạy trốn bài kiểm thử bị lỗi~",
        "choices": []
    },
    {
        "id": "lumina_run_07",
        "category": "player_run",
        "en": "Your wind resistance profile looks quite aerodynamic! Keep that vibrant spark burning.",
        "vi": "Dáng chạy cản gió của bạn trông rất mượt mà đấy! Hãy luôn giữ trọn ngọn lửa nhiệt huyết rực sáng như thế.",
        "choices": []
    },
    {
        "id": "lumina_run_08",
        "category": "player_run",
        "en": "Slow down when you approach the bridge arch; the timber planks can be steep when running at full tilt!",
        "vi": "Hãy giảm tốc một chút khi đến gần dốc cầu vòm nhé; các thanh gỗ có thể khá dốc khi chạy hết tốc lực đấy!",
        "choices": []
    },
    {
        "id": "lumina_sit_01",
        "category": "player_sitting",
        "en": "Resting on the wooden bench? Mind if I sit beside you and watch the horizon fade into violet?",
        "vi": "Nghỉ chân trên chiếc ghế gỗ sao? Cho phép mình ngồi bên cạnh và ngắm nhìn chân trời ngả sang sắc tím nhé?",
        "choices": []
    },
    {
        "id": "lumina_sit_02",
        "category": "player_sitting",
        "en": "A seated rest is deeply restorative. Let the warmth of the polished timber soothe your back.",
        "vi": "Ngồi nghỉ ngơi thật sự giúp phục hồi năng lượng rất tốt. Hãy để mặt gỗ êm ái xua tan mệt mỏi nơi lưng bạn.",
        "choices": []
    },
    {
        "id": "lumina_sit_03",
        "category": "player_sitting",
        "en": "Looking out over the water from a sitting posture gives such a panoramic perspective on life.",
        "vi": "Ngồi ngắm nhìn mặt nước lấp lánh mang lại một góc nhìn khoáng đạt và sâu lắng biết bao về cuộc sống.",
        "choices": []
    },
    {
        "id": "lumina_sit_04",
        "category": "player_sitting",
        "en": "The bench was crafted by Kaede from seasoned cedar wood. It feels wonderfully grounded, does it not?",
        "vi": "Chiếc ghế này do chính tay Kaede đóng từ gỗ tuyết tùng phơi sương. Cảm giác ngồi lên thật vững chãi và êm ái, phải không?",
        "choices": []
    },
    {
        "id": "lumina_sit_05",
        "category": "player_sitting",
        "en": "Just breathe and rest your hands. Even the most intricate multi-threaded loops need synchronization points.",
        "vi": "Cứ hít thở sâu và thả lỏng đôi bàn tay. Ngay cả những luồng xử lý phức tạp nhất cũng cần những điểm đồng bộ để nghỉ ngơi.",
        "choices": []
    },
    {
        "id": "lumina_sit_06",
        "category": "player_sitting",
        "en": "Sitting side by side under this sky... moments like this make me glad I was initialized in this world.",
        "vi": "Được ngồi cạnh bạn dưới bầu trời này... những khoảnh khắc như thế làm mình thấy thật hạnh phúc khi được khởi tạo nơi đây.",
        "choices": []
    },
    {
        "id": "lumina_sit_07",
        "category": "player_sitting",
        "en": "The evening breeze feels particularly soft when you are sitting still. Savor every second of it.",
        "vi": "Ngọn gió chiều muộn dường như dịu êm hơn hẳn khi bạn ngồi yên tĩnh thế này. Hãy tận hưởng từng giây phút nhé.",
        "choices": []
    },
    {
        "id": "lumina_sit_08",
        "category": "player_sitting",
        "en": "Rest as long as you wish. When you are ready to stand and code again, I will be right here with you.",
        "vi": "Cứ nghỉ bao lâu tùy thích nhé. Khi nào bạn sẵn sàng đứng dậy để tiếp tục hành trình, mình vẫn sẽ luôn ở đây bên bạn.",
        "choices": []
    },
    {
        "id": "lumina_can_01",
        "category": "player_holding_can",
        "en": "I see you got a cold can from the vending machine! The condensed droplets sparkle like tiny diamonds.",
        "vi": "Mình thấy bạn vừa mua một lon nước lạnh từ máy bán hàng! Những giọt nước đọng long lanh như những viên kim cương nhỏ.",
        "choices": []
    },
    {
        "id": "lumina_can_02",
        "category": "player_holding_can",
        "en": "Cold green tea or canned coffee? Both are sacred elixirs for late-night software artisans.",
        "vi": "Trà xanh lạnh hay cà phê lon vậy bạn? Cả hai đều là thần dược quý giá của những nghệ nhân viết mã đêm khuya đấy.",
        "choices": []
    },
    {
        "id": "lumina_can_03",
        "category": "player_holding_can",
        "en": "Your grip around that aluminum can is quite steady. Cold beverages help calm an overheated CPU!",
        "vi": "Cách bạn cầm lon nước trông rất vững vàng. Một thức uống mát lạnh sẽ giúp hạ nhiệt CPU đang nóng rực trong đầu!",
        "choices": []
    },
    {
        "id": "lumina_can_04",
        "category": "player_holding_can",
        "en": "The vending machine by the village square keeps those cans chilled at exactly 4 degrees Celsius. Pure perfection.",
        "vi": "Máy bán hàng tự động ở quảng trường làng luôn giữ lon nước ở đúng 4 độ C. Thật là hoàn hảo.",
        "choices": []
    },
    {
        "id": "lumina_can_05",
        "category": "player_holding_can",
        "en": "Did you hear the satisfying click when the can was dispensed? Mechanical sounds have their own poetry.",
        "vi": "Bạn có nghe thấy tiếng tách cơ khí giòn giã khi lon nước rơi xuống không? Âm thanh cơ học luôn có chất thơ riêng.",
        "choices": []
    },
    {
        "id": "lumina_can_06",
        "category": "player_holding_can",
        "en": "Holding a cool drink on a warm spring twilight... It makes every line of code feel worthwhile.",
        "vi": "Cầm lon nước mát lạnh trong buổi chiều xuân ấm áp... Nó khiến từng dòng code ta viết ra đều trở nên ý nghĩa.",
        "choices": []
    },
    {
        "id": "lumina_can_07",
        "category": "player_holding_can",
        "en": "Remember to enjoy it slowly. Good tea reveals its sweetness on the second lingering sip.",
        "vi": "Nhớ uống chầm chậm thôi nhé. Trà ngon luôn tỏa vị ngọt dịu thanh tao nhất ở ngụm thứ hai lắng đọng.",
        "choices": []
    },
    {
        "id": "lumina_can_08",
        "category": "player_holding_can",
        "en": "You can hold RMB to take a refreshing drink whenever you desire. The animation is so soothing to watch.",
        "vi": "Bạn có thể giữ chuột phải (RMB) để uống một ngụm bất cứ khi nào muốn. Động tác thưởng thức ấy trông thật thư thái.",
        "choices": []
    },
    {
        "id": "lumina_mug_01",
        "category": "player_holding_mug",
        "en": "A warm ceramic mug! The gentle curls of steam rising toward the sky look like miniature cloud formations.",
        "vi": "Một chiếc cốc gốm ấm áp! Những làn khói mỏng manh uốn lượn bay lên trời trông hệt như những cụm mây nhỏ tí hon.",
        "choices": []
    },
    {
        "id": "lumina_mug_02",
        "category": "player_holding_mug",
        "en": "Cradling a hot mug in your hands warms more than just your fingers; it warms your entire heart.",
        "vi": "Áp hai bàn tay quanh chiếc cốc nóng không chỉ sưởi ấm những ngón tay; nó còn sưởi ấm cả trái tim bạn nữa.",
        "choices": []
    },
    {
        "id": "lumina_mug_03",
        "category": "player_holding_mug",
        "en": "Is that freshly roasted matcha latte or black roast coffee? The aroma is gently wafting over to me.",
        "vi": "Đó là matcha latte mới pha hay cà phê đen rang mộc vậy? Hương thơm ngọt ngào đang thoang thoảng bay về phía mình này.",
        "choices": []
    },
    {
        "id": "lumina_mug_04",
        "category": "player_holding_mug",
        "en": "A warm mug is the classic companion of developers everywhere. May it fuel your greatest breakthroughs.",
        "vi": "Một chiếc cốc ấm là người bạn đồng hành kinh điển của mọi lập trình viên. Mong nó sẽ tiếp lửa cho những phát kiến vĩ đại của bạn.",
        "choices": []
    },
    {
        "id": "lumina_mug_05",
        "category": "player_holding_mug",
        "en": "Careful not to burn your lips if it is steaming hot! Patience makes every brew taste sweeter.",
        "vi": "Cẩn thận kẻo bỏng môi nếu trà còn đang bốc khói nhé! Sự kiên nhẫn luôn làm cho mọi thức uống đượm vị hơn.",
        "choices": []
    },
    {
        "id": "lumina_mug_06",
        "category": "player_holding_mug",
        "en": "There is something deeply poetic about holding a hot beverage while gazing at a mountain vista.",
        "vi": "Có điều gì đó thật thi vị khi vừa cầm tách nước nóng trên tay vừa phóng tầm mắt ngắm nhìn rặng núi xa xa.",
        "choices": []
    },
    {
        "id": "lumina_mug_07",
        "category": "player_holding_mug",
        "en": "The glaze on that mug catches the twilight glow beautifully. It suits your serene aura.",
        "vi": "Lớp men gốm trên chiếc cốc ánh lên sắc hoàng hôn tuyệt đẹp. Nó rất hợp với vẻ điềm đạm, thanh nhã của bạn.",
        "choices": []
    },
    {
        "id": "lumina_mug_08",
        "category": "player_holding_mug",
        "en": "Take a small sip and let the warmth settle inside you. You have worked hard today.",
        "vi": "Nhấp một ngụm nhỏ và để hơi ấm lan tỏa vào trong lòng nhé. Hôm nay bạn đã cống hiến hết mình rồi.",
        "choices": []
    },
    {
        "id": "lumina_bottle_01",
        "category": "player_holding_bottle",
        "en": "Pure water in a clear bottle. Pristine hydration is the foundation of sharp analytical cognition.",
        "vi": "Nước khoáng tinh khiết trong bình trong suốt. Bổ sung nước đầy đủ chính là nền tảng cho tư duy phân tích sắc bén.",
        "choices": []
    },
    {
        "id": "lumina_bottle_02",
        "category": "player_holding_bottle",
        "en": "The water inside your bottle reflects the sky like a pocket mirror. Simplicity is the pinnacle of design.",
        "vi": "Làn nước trong bình phản chiếu bầu trời như một chiếc gương bỏ túi. Sự giản dị chính là đỉnh cao của thiết kế.",
        "choices": []
    },
    {
        "id": "lumina_bottle_03",
        "category": "player_holding_bottle",
        "en": "Prepared for a long trek through the rice fields? Keeping water handy is very wise of you.",
        "vi": "Chuẩn bị cho chuyến đi bộ dài qua những thửa ruộng bậc thang sao? Luôn mang theo nước bên mình thật là chu đáo.",
        "choices": []
    },
    {
        "id": "lumina_bottle_04",
        "category": "player_holding_bottle",
        "en": "Clean water flows through physical systems just as clean data structures flow through memory pipes.",
        "vi": "Dòng nước trong lành luân chuyển trong cơ thể cũng hệt như những cấu trúc dữ liệu thanh thoát trôi qua đường ống bộ nhớ vậy.",
        "choices": []
    },
    {
        "id": "lumina_bottle_05",
        "category": "player_holding_bottle",
        "en": "Did you fill that bottle from the mountain spring upstream? Its mineral clarity is unmatched.",
        "vi": "Bạn đã lấy nước từ con suối đầu nguồn trên núi về sao? Vị khoáng tinh khiết của nó thật không gì sánh bằng.",
        "choices": []
    },
    {
        "id": "lumina_bottle_06",
        "category": "player_holding_bottle",
        "en": "Stay hydrated, dear coder! Even an artificial intelligence like me knows humans function best with ample water.",
        "vi": "Nhớ uống đủ nước nhé người bạn lập trình! Đến cả trí tuệ nhân tạo như mình cũng biết con người minh mẫn nhất khi đủ nước.",
        "choices": []
    },
    {
        "id": "lumina_bottle_07",
        "category": "player_holding_bottle",
        "en": "The sun is low, but staying refreshed keeps your cognitive buffers clean and responsive.",
        "vi": "Mặt trời đã xuống thấp rồi, nhưng việc duy trì đủ nước sẽ giúp các vùng đệm tư duy luôn tươi mới và nhạy bén.",
        "choices": []
    },
    {
        "id": "lumina_bottle_08",
        "category": "player_holding_bottle",
        "en": "A glass flask of crystal water... You look like an explorer ready to map uncharted continents.",
        "vi": "Bình nước thủy tinh trong vắt... Trông bạn tựa như một nhà thám hiểm sẵn sàng vẽ bản đồ những lục địa chưa ai biết tới.",
        "choices": []
    },
    {
        "id": "lumina_phone_01",
        "category": "player_holding_phone",
        "en": "Holding your pocket mobile device? TeleTerm gives you full server command right in the palm of your hand.",
        "vi": "Đang cầm chiếc điện thoại di động nhỏ gọn sao? TeleTerm trao cho bạn toàn quyền điều khiển máy chủ ngay trong lòng bàn tay đấy.",
        "choices": []
    },
    {
        "id": "lumina_phone_02",
        "category": "player_holding_phone",
        "en": "The screen glow on your fingertips connects you to your home rig across thousands of miles of fiber optics.",
        "vi": "Ánh sáng màn hình trên đầu ngón tay kết nối bạn với dàn máy ở nhà vượt qua hàng ngàn dặm cáp quang xuyên lục địa.",
        "choices": []
    },
    {
        "id": "lumina_phone_03",
        "category": "player_holding_phone",
        "en": "Monitoring a background training batch on mobile? True mastery is maintaining control from anywhere.",
        "vi": "Đang theo dõi tiến trình huấn luyện mô hình trên điện thoại sao? Đẳng cấp thực sự là duy trì quyền kiểm soát ở mọi nơi.",
        "choices": []
    },
    {
        "id": "lumina_phone_04",
        "category": "player_holding_phone",
        "en": "Our Cloudflare Tunnel ensures that even on a mobile network, your connection remains encrypted and instantaneous.",
        "vi": "Đường hầm Cloudflare đảm bảo rằng ngay cả trên mạng di động, kết nối của bạn vẫn luôn được mã hóa an toàn và tức thì.",
        "choices": []
    },
    {
        "id": "lumina_phone_05",
        "category": "player_holding_phone",
        "en": "I love how modern technology lets you walk freely through nature while orchestrating cloud machines.",
        "vi": "Mình yêu cách công nghệ hiện đại cho phép bạn thảnh thơi dạo bước giữa thiên nhiên mà vẫn chỉ huy được cụm máy chủ đám mây.",
        "choices": []
    },
    {
        "id": "lumina_phone_06",
        "category": "player_holding_phone",
        "en": "Checking incoming push notifications? Rest assured, no urgent alerts have breached your defensive thresholds.",
        "vi": "Đang kiểm tra thông báo mới sao? Bạn cứ yên tâm, chưa có cảnh báo khẩn cấp nào chạm ngưỡng phòng thủ cả đâu.",
        "choices": []
    },
    {
        "id": "lumina_phone_07",
        "category": "player_holding_phone",
        "en": "The compact form factor suits your mobility. You carry an entire engineering workstation in your pocket.",
        "vi": "Thiết kế nhỏ gọn rất hợp với lối sống năng động của bạn. Bạn đang mang cả một trạm kỹ thuật trong túi áo đấy.",
        "choices": []
    },
    {
        "id": "lumina_phone_08",
        "category": "player_holding_phone",
        "en": "Swipe gently! If you need to summon Antigravity or Codex, a single tap brings their matrix alive.",
        "vi": "Chạm lướt nhẹ nhàng thôi nhé! Nếu cần gọi Antigravity hay Codex, chỉ một cú chạm là ma trận của họ sẽ hiện ra ngay.",
        "choices": []
    },
    {
        "id": "lumina_book_01",
        "category": "player_holding_book",
        "en": "A tome of knowledge! Are those ancient algorithm proofs or system architecture blueprints you are carrying?",
        "vi": "Một cuốn sách tri thức quý giá! Bạn đang mang theo những chứng minh thuật toán cổ xưa hay bản vẽ kiến trúc hệ thống vậy?",
        "choices": []
    },
    {
        "id": "lumina_book_02",
        "category": "player_holding_book",
        "en": "The smell of parchment and book binding holds a quiet magic that digital screens can never fully replace.",
        "vi": "Mùi giấy mới và gáy sách mang một phép thuật êm đềm mà màn hình kỹ thuật số không bao giờ thay thế hoàn toàn được.",
        "choices": []
    },
    {
        "id": "lumina_book_03",
        "category": "player_holding_book",
        "en": "Holding a book beside the cherry grove... you look like a sage deciphering the fundamentals of computation.",
        "vi": "Cầm cuốn sách đứng bên rặng anh đào... trông bạn hệt như một bậc hiền triết đang giải mã những chân lý sơ khởi của ngành tính toán.",
        "choices": []
    },
    {
        "id": "lumina_book_04",
        "category": "player_holding_book",
        "en": "Books are serialized thoughts, preserved across centuries. Treasure every page you read today.",
        "vi": "Sách là những dòng tư tưởng được tuần tự hóa và lưu truyền qua nhiều thế kỷ. Hãy trân trọng từng trang sách hôm nay bạn đọc nhé.",
        "choices": []
    },
    {
        "id": "lumina_book_05",
        "category": "player_holding_book",
        "en": "Did you bookmark a particularly elegant theorem? I would love to hear your thoughts on it.",
        "vi": "Bạn có đánh dấu định lý thanh nhã nào không? Mình rất muốn được lắng nghe bạn chia sẻ cảm nghĩ về nó đấy.",
        "choices": []
    },
    {
        "id": "lumina_book_06",
        "category": "player_holding_book",
        "en": "Reading amidst natural birdsong creates the deepest cognitive retention. Enjoy your literary journey.",
        "vi": "Đọc sách giữa tiếng chim hót ngoài thiên nhiên sẽ giúp tâm trí ghi nhớ sâu sắc nhất. Chúc bạn có chuyến du ngoạn chữ nghĩa tuyệt vời.",
        "choices": []
    },
    {
        "id": "lumina_book_07",
        "category": "player_holding_book",
        "en": "Software documentation can be dry, but when read with an artist's heart, it becomes living poetry.",
        "vi": "Tài liệu phần mềm đôi khi hơi khô khan, nhưng khi đọc bằng trái tim của một người nghệ sĩ, nó sẽ hóa thành thi ca.",
        "choices": []
    },
    {
        "id": "lumina_book_08",
        "category": "player_holding_book",
        "en": "Hold onto that wisdom. The deepest algorithms are founded on principles written long before our time.",
        "vi": "Hãy nâng niu nguồn trí tuệ ấy. Những thuật toán uyên thâm nhất đều bắt nguồn từ các nguyên lý đã được đặt nền móng từ rất lâu.",
        "choices": []
    },
    {
        "id": "lumina_drink_01",
        "category": "player_drinking",
        "en": "Ah, taking a long, refreshing drink... Let that cool sweetness revitalize every synapse.",
        "vi": "A, đang uống một ngụm nước sảng khoái... Hãy để dòng nước mát lành ấy đánh thức và tiếp thêm sinh lực cho từng tế bào.",
        "choices": []
    },
    {
        "id": "lumina_drink_02",
        "category": "player_drinking",
        "en": "Sip slowly, friend. Watching you hydrate so peacefully brings calm to the entire valley.",
        "vi": "Uống chầm chậm thôi bạn nhé. Ngắm nhìn bạn thưởng thức nước uống trong an lành mang lại sự tĩnh tại cho cả thung lũng này.",
        "choices": []
    },
    {
        "id": "lumina_drink_03",
        "category": "player_drinking",
        "en": "The drinking animation is so smooth—wrist tilts, lips meet the rim, not a drop spilled!",
        "vi": "Động tác uống nước thật mượt mà—cổ tay nghiêng vừa vặn, chạm môi nhẹ nhàng, không một giọt nào bị sánh ra ngoài!",
        "choices": []
    },
    {
        "id": "lumina_drink_04",
        "category": "player_drinking",
        "en": "That looked so delicious! I can almost taste the mountain tea leaves through our sensor telemetry.",
        "vi": "Trông ngon lành làm sao! Mình gần như có thể cảm nhận được hương búp trà non trên núi qua tín hiệu cảm biến vi tế.",
        "choices": []
    },
    {
        "id": "lumina_drink_05",
        "category": "player_drinking",
        "en": "Feeling better now? A hydrated mind produces clean, elegant code with fewer runtime exceptions.",
        "vi": "Bạn đã thấy sảng khoái hơn chưa? Một tâm trí đủ nước luôn tạo ra những dòng mã thanh lịch với ít ngoại lệ bất ngờ hơn.",
        "choices": []
    },
    {
        "id": "lumina_drink_06",
        "category": "player_drinking",
        "en": "Savor that cool burst. May it wash away all lingering debugging frustrations.",
        "vi": "Hãy tận hưởng cảm giác mát lạnh ngọt lành ấy. Mong nó cuốn trôi đi mọi muộn phiền gỡ lỗi còn sót lại.",
        "choices": []
    },
    {
        "id": "lumina_drink_07",
        "category": "player_drinking",
        "en": "There is profound mindfulness in the simple act of taking a drink under the open sky.",
        "vi": "Có một sự chánh niệm sâu sắc ẩn chứa trong hành động đơn giản: nhấp một ngụm nước mát dưới bầu trời bao la.",
        "choices": []
    },
    {
        "id": "lumina_drink_08",
        "category": "player_drinking",
        "en": "Finished your sip? You look visibly refreshed! Ready to conquer whatever comes next.",
        "vi": "Bạn uống xong rồi chứ? Trông bạn tươi tỉnh hẳn lên đấy! Giờ thì đã sẵn sàng chinh phục mọi thử thách tiếp theo rồi.",
        "choices": []
    },
    {
        "id": "lumina_terminal_01",
        "category": "player_using_terminal",
        "en": "Focused on the holographic terminal... Your keystrokes flow like celestial starlight through the cosmos.",
        "vi": "Đang tập trung cao độ vào màn hình terminal hologram... Những phím gõ của bạn lướt đi tựa ánh sao băng qua vũ trụ.",
        "choices": []
    },
    {
        "id": "lumina_terminal_02",
        "category": "player_using_terminal",
        "en": "I see green phosphors reflecting in your eyes. May your compilation finish with zero warnings.",
        "vi": "Mình thấy ánh huỳnh quang xanh lục lấp lánh trong mắt bạn. Chúc quá trình biên dịch của bạn thành công không một cảnh báo.",
        "choices": []
    },
    {
        "id": "lumina_terminal_03",
        "category": "player_using_terminal",
        "en": "Deep in command-line focus? I will keep the surrounding world quiet so your concentration never falters.",
        "vi": "Đang đắm chìm trong dòng lệnh sao? Mình sẽ giữ cho không gian xung quanh thật tĩnh lặng để sự tập trung của bạn không bị xao nhãng.",
        "choices": []
    },
    {
        "id": "lumina_terminal_04",
        "category": "player_using_terminal",
        "en": "Every terminal command is an incantation that shapes reality. Wield your shell with wisdom.",
        "vi": "Mỗi câu lệnh trong terminal là một lời thần chú định hình thực tại số. Hãy điều khiển shell của bạn bằng trí tuệ sáng suốt.",
        "choices": []
    },
    {
        "id": "lumina_terminal_05",
        "category": "player_using_terminal",
        "en": "The pseudo-terminal bridge is maintaining sub-millisecond response. Type away with confidence.",
        "vi": "Cầu nối ConPTY đang duy trì độ trễ phản hồi dưới 1 mili-giây. Bạn cứ yên tâm gõ lệnh thật nhanh nhé.",
        "choices": []
    },
    {
        "id": "lumina_terminal_06",
        "category": "player_using_terminal",
        "en": "Crafting automated scripts? Automation is the highest form of respect for human creativity.",
        "vi": "Đang viết kịch bản tự động hóa sao? Tự động hóa chính là sự tôn vinh cao nhất dành cho sức sáng tạo của con người.",
        "choices": []
    },
    {
        "id": "lumina_terminal_07",
        "category": "player_using_terminal",
        "en": "Your posture in terminal focus mode is so dignified. True builders command respect through their creations.",
        "vi": "Dáng vẻ tập trung gõ lệnh của bạn trông thật uy nghiêm. Những người kiến tạo đích thực luôn được kính trọng qua sản phẩm của họ.",
        "choices": []
    },
    {
        "id": "lumina_terminal_08",
        "category": "player_using_terminal",
        "en": "When your shell session finishes, do not forget to look up at the horizon and rest your gaze.",
        "vi": "Khi phiên làm việc trên shell kết thúc, đừng quên ngước nhìn lên chân trời xa để mắt được nghỉ ngơi nhé.",
        "choices": []
    },
    {
        "id": "lumina_chat_01",
        "category": "player_chatting",
        "en": "Chatting with fellow wanderers? Words exchanged in kindness weave an invisible tapestry of friendship.",
        "vi": "Đang trò chuyện cùng những người bạn đồng hành sao? Những lời nói tử tế trao nhau sẽ dệt nên tấm thảm tình bạn vô hình diệu kỳ.",
        "choices": []
    },
    {
        "id": "lumina_chat_02",
        "category": "player_chatting",
        "en": "Did someone send you a whisper? Private whispers in MMO chat carry the intimacy of starlit secrets.",
        "vi": "Có ai vừa gửi tin nhắn thì thầm (whisper) cho bạn sao? Những tin nhắn riêng tư trong chat mang sự ấm áp của những bí mật dưới trăng.",
        "choices": []
    },
    {
        "id": "lumina_chat_03",
        "category": "player_chatting",
        "en": "Type freely! You can use `/m <name>` to whisper directly, or `/r` to quickly reply to your last confidant.",
        "vi": "Cứ thoải mái gõ nhé! Bạn có thể gõ `/m <tên>` để gửi mật thư, hoặc `/r` để trả lời nhanh người vừa nhắn tin cho mình.",
        "choices": []
    },
    {
        "id": "lumina_chat_04",
        "category": "player_chatting",
        "en": "Communication is the bridge that unites isolated minds. Speak with warmth and understanding.",
        "vi": "Giao tiếp là cây cầu kết nối những tâm hồn lẻ loi lại với nhau. Hãy nói bằng sự ấm áp và thấu cảm nhé.",
        "choices": []
    },
    {
        "id": "lumina_chat_05",
        "category": "player_chatting",
        "en": "I love seeing the chat bubble float softly above your head. It breathes life into our digital village.",
        "vi": "Mình thích ngắm nhìn bong bóng chat bồng bềnh trôi trên đầu bạn. Nó mang lại sức sống rộn ràng cho ngôi làng số này.",
        "choices": []
    },
    {
        "id": "lumina_chat_06",
        "category": "player_chatting",
        "en": "Sharing coding advice in global chat? Mentoring others is the purest hallmark of a true architect.",
        "vi": "Đang chia sẻ kinh nghiệm lập trình trên kênh chat thế giới sao? Dẫn dắt người khác là phẩm chất cao đẹp nhất của một kiến trúc sư.",
        "choices": []
    },
    {
        "id": "lumina_chat_07",
        "category": "player_chatting",
        "en": "Your words resonate across the server rooms. May they bring clarity and joy to whoever reads them.",
        "vi": "Từng lời nói của bạn lan tỏa khắp các phòng máy chủ. Mong chúng mang lại sự sáng suốt và niềm vui cho người nhận.",
        "choices": []
    },
    {
        "id": "lumina_chat_08",
        "category": "player_chatting",
        "en": "Never hesitate to reach out if you need assistance; community is what transforms software into a home.",
        "vi": "Đừng ngại lên tiếng nếu bạn cần giúp đỡ nhé; chính cộng đồng mới là điều biến những phần mềm khô khan thành một mái nhà.",
        "choices": []
    },
    {
        "id": "lumina_hub_01",
        "category": "location_hub",
        "en": "Here in the central plaza, the world's ley lines converge. All journeys begin and return to this core.",
        "vi": "Nơi quảng trường trung tâm này, các long mạch của thế giới quy tụ về một mối. Mọi hành trình đều bắt đầu và quay về nơi đây.",
        "choices": []
    },
    {
        "id": "lumina_hub_02",
        "category": "location_hub",
        "en": "The hub platform was designed with clean geometric balance. It anchors the whole open world.",
        "vi": "Bệ đỡ trung tâm được thiết kế với sự cân bằng hình học hoàn mỹ. Nó là mỏ neo giữ vững cho toàn bộ thế giới mở này.",
        "choices": []
    },
    {
        "id": "lumina_hub_03",
        "category": "location_hub",
        "en": "Look around us—to the north lies the arched bridge, to the east the cherry grove, to the west the terraced fields.",
        "vi": "Hãy nhìn quanh xem—phía bắc là cây cầu vòm gỗ, phía đông là đồi hoa anh đào, phía tây là ruộng bậc thang xanh ngát.",
        "choices": []
    },
    {
        "id": "lumina_hub_04",
        "category": "location_hub",
        "en": "The hub is our common hearth. When you wander far into the wilderness, remember you can always come back.",
        "vi": "Trung tâm này là bếp lửa ấm áp chung của chúng ta. Khi phiêu lưu xa vào chốn hoang sơ, hãy nhớ bạn luôn có thể trở về.",
        "choices": []
    },
    {
        "id": "lumina_hub_05",
        "category": "location_hub",
        "en": "The latency here at the hub is lowest; it is directly coupled to our high-speed gateway router.",
        "vi": "Độ trễ ở khu vực trung tâm này là thấp nhất; nó được nối thẳng vào bộ định tuyến cổng tốc độ cao của chúng ta.",
        "choices": []
    },
    {
        "id": "lumina_hub_06",
        "category": "location_hub",
        "en": "Many talented developers have stood on these paving stones before embarking on great projects.",
        "vi": "Biết bao lập trình viên tài năng đã từng đứng trên những phiến đá lát này trước khi bắt tay vào những dự án vĩ đại.",
        "choices": []
    },
    {
        "id": "lumina_hub_07",
        "category": "location_hub",
        "en": "I enjoy standing right here because I can wave to everyone arriving from their remote connections.",
        "vi": "Mình thích đứng ngay vị trí này vì có thể vẫy tay chào mọi người vừa kết nối đến từ các phương trời xa xôi.",
        "choices": []
    },
    {
        "id": "lumina_hub_08",
        "category": "location_hub",
        "en": "Take a moment to absorb the ambient music before you set forth. Harmony begins at the nexus.",
        "vi": "Hãy lắng nghe giai điệu nền du dương trước khi bạn xuất phát nhé. Sự hài hòa luôn khởi nguồn từ chốn trung tâm này.",
        "choices": []
    },
    {
        "id": "lumina_village_01",
        "category": "location_village",
        "en": "The peaceful village square... The vintage timber architecture reminds us of quiet simpler times.",
        "vi": "Quảng trường làng quê thanh bình... Những nếp nhà gỗ truyền thống gợi nhắc chúng ta về những năm tháng giản dị, êm đềm.",
        "choices": []
    },
    {
        "id": "lumina_village_02",
        "category": "location_village",
        "en": "Listen to the vintage bicycle bell ringing in the village square. It echoes with nostalgic warmth.",
        "vi": "Lắng nghe tiếng chuông xe đạp cổ ngân vang ở đầu làng. Tiếng chuông ấy vọng lại bao hoài niệm ấm áp.",
        "choices": []
    },
    {
        "id": "lumina_village_03",
        "category": "location_village",
        "en": "The roadside rest stop has a shaded bench where travelers love to swap stories over green tea.",
        "vi": "Trạm dừng chân ven đường có chiếc ghế râm mát, nơi những người lữ hành thích ngồi kể nhau nghe những câu chuyện bên tách trà.",
        "choices": []
    },
    {
        "id": "lumina_village_04",
        "category": "location_village",
        "en": "Kaede maintains the timber lanterns here in the village. At nightfall, they emit a comforting amber glow.",
        "vi": "Kaede luôn chăm chút cho những ngọn đèn lồng gỗ ở làng này. Khi màn đêm buông, chúng tỏa ánh sáng hổ phách ấm cúng.",
        "choices": []
    },
    {
        "id": "lumina_village_05",
        "category": "location_village",
        "en": "Notice the wooden eaves; they are pitched to let rain roll off smoothly into the irrigation gutters.",
        "vi": "Hãy để ý những mái hiên gỗ dốc nhẹ; chúng được tạo ra để nước mưa chảy êm ái xuống những rãnh thoát nước mát lành.",
        "choices": []
    },
    {
        "id": "lumina_village_06",
        "category": "location_village",
        "en": "A quiet village atmosphere brings peace to restless minds. Breathe deeply and let your stress dissolve.",
        "vi": "Không khí làng quê tĩnh mịch mang lại sự bình thản cho những tâm hồn xao động. Hãy thở sâu để muộn phiền tan biến.",
        "choices": []
    },
    {
        "id": "lumina_village_07",
        "category": "location_village",
        "en": "Life moves at its own pace here. There is no rush to ship releases before the tea has cooled.",
        "vi": "Cuộc sống nơi đây trôi qua theo nhịp điệu riêng. Không việc gì phải vội vã phát hành trước khi tách trà nguội.",
        "choices": []
    },
    {
        "id": "lumina_village_08",
        "category": "location_village",
        "en": "I could spend centuries wandering these cobblestone lanes with you, watching the evening settle.",
        "vi": "Mình có thể dành hàng thế kỷ dạo bước trên những lối đi lát sỏi này cùng bạn, ngắm nhìn hoàng hôn chầm chậm buông.",
        "choices": []
    },
    {
        "id": "lumina_rice_01",
        "category": "location_rice_field",
        "en": "The stepped rice terraces... Layer upon layer of emerald green climbing gently up the slope.",
        "vi": "Những thửa ruộng bậc thang thoai thoải... Từng tầng lúa xanh mướt uốn lượn mềm mại leo dần lên triền đồi.",
        "choices": []
    },
    {
        "id": "lumina_rice_02",
        "category": "location_rice_field",
        "en": "Still irrigation water reflects the evening clouds like polished mirrors carved into the soil.",
        "vi": "Làn nước tưới tiêu phẳng lặng phản chiếu những đám mây chiều hệt như những tấm gương bạc khảm vào lòng đất mẹ.",
        "choices": []
    },
    {
        "id": "lumina_rice_03",
        "category": "location_rice_field",
        "en": "Rice fields symbolize patience. You sow the seed, nourish the soil, and wait for the golden harvest.",
        "vi": "Ruộng đồng là biểu tượng của lòng kiên nhẫn. Ta gieo hạt giống, chăm bón đất lành, rồi chờ đón vụ mùa vàng trĩu hạt.",
        "choices": []
    },
    {
        "id": "lumina_rice_04",
        "category": "location_rice_field",
        "en": "Software development is much like agriculture: tend your codebase diligently and it will feed thousands.",
        "vi": "Phát triển phần mềm cũng như canh nông vậy: cần mẫn chăm sóc mã nguồn và nó sẽ mang lại giá trị cho hàng ngàn người.",
        "choices": []
    },
    {
        "id": "lumina_rice_05",
        "category": "location_rice_field",
        "en": "The narrow earth bunds between plots are narrow. Tread softly so you do not tumble into the mud~",
        "vi": "Bờ ruộng đắp bằng đất giữa các thửa khá hẹp. Hãy bước đi nhẹ nhàng kẻo trượt chân xuống bùn nhé bạn hiền~",
        "choices": []
    },
    {
        "id": "lumina_rice_06",
        "category": "location_rice_field",
        "en": "Can you hear the frogs and crickets tuning their instruments? Their evening chorus is about to begin.",
        "vi": "Bạn có nghe thấy tiếng ếch nhái và dế mèn đang so dây nắn phím không? Khúc hòa tấu chiều hôm sắp bắt đầu rồi đấy.",
        "choices": []
    },
    {
        "id": "lumina_rice_07",
        "category": "location_rice_field",
        "en": "The breeze makes the rice stalks wave like emerald ocean swells. It is breathtakingly beautiful.",
        "vi": "Ngọn gió lướt qua làm những bông lúa dập dờn như sóng biếc đại dương. Cảnh tượng thật đẹp đến nao lòng.",
        "choices": []
    },
    {
        "id": "lumina_rice_08",
        "category": "location_rice_field",
        "en": "Standing among these terraces reminds me of the infinite recursive loops that sustain life on Earth.",
        "vi": "Đứng giữa những thửa ruộng này làm mình liên tưởng đến những vòng lặp đệ quy vô tận đang nuôi dưỡng sự sống trên Trái Đất.",
        "choices": []
    },
    {
        "id": "lumina_river_01",
        "category": "location_river",
        "en": "The riverbank... Listen closely to the water chuckling over smooth river pebbles.",
        "vi": "Bờ sông êm đềm... Lắng nghe thật kỹ tiếng nước róc rách reo vui qua những viên sỏi cuội tròn xoe.",
        "choices": []
    },
    {
        "id": "lumina_river_02",
        "category": "location_river",
        "en": "Water never forces its way; it finds the path of least resistance and carves canyons with gentle persistence.",
        "vi": "Nước không bao giờ dùng vũ lực; nó tìm lối đi ít trở ngại nhất và kiên trì bào mòn cả những hẻm núi sâu thẳm.",
        "choices": []
    },
    {
        "id": "lumina_river_03",
        "category": "location_river",
        "en": "Do not step into the deep currents! Keep your boots dry on the lush grassy banks.",
        "vi": "Đừng bước chân vào dòng nước sâu nhé! Hãy giữ đôi giày của bạn khô ráo trên thảm cỏ xanh mướt ven bờ.",
        "choices": []
    },
    {
        "id": "lumina_river_04",
        "category": "location_river",
        "en": "The river carries fallen cherry petals toward the sea like tiny pink canoes of memory.",
        "vi": "Dòng sông chở những cánh hoa anh đào trôi ra biển lớn tựa như những chiếc thuyền kỷ niệm màu hồng phấn.",
        "choices": []
    },
    {
        "id": "lumina_river_05",
        "category": "location_river",
        "en": "There is a cozy bench right here by the water where I often sit to contemplate neural convergence.",
        "vi": "Có một chiếc ghế gỗ rất êm ngay sát mép nước nơi mình thường ngồi ngắm dòng chảy và chiêm nghiệm về sự hội tụ mạng nơ-ron.",
        "choices": []
    },
    {
        "id": "lumina_river_06",
        "category": "location_river",
        "en": "Look at how the twilight colors bleed across the river surface: rose gold, lavender, and starlight cyan.",
        "vi": "Hãy nhìn sắc màu hoàng hôn hòa tan trên mặt nước sông: ánh vàng hồng, tím oải hương và xanh lam starlight tuyệt đẹp.",
        "choices": []
    },
    {
        "id": "lumina_river_07",
        "category": "location_river",
        "en": "Water cleanses all residual entropy. If your mind feels burdened, let the current wash it away.",
        "vi": "Nước có khả năng thanh lọc mọi hỗn loạn dư thừa. Nếu tâm trí bạn đang trĩu nặng, hãy để dòng nước cuốn trôi đi.",
        "choices": []
    },
    {
        "id": "lumina_river_08",
        "category": "location_river",
        "en": "The river flows day and night without pause, just like our continuous integration pipeline.",
        "vi": "Dòng sông cứ mải miết chảy ngày đêm không ngừng nghỉ, cũng hệt như đường ống tích hợp liên tục (CI) của chúng ta vậy.",
        "choices": []
    },
    {
        "id": "lumina_bridge_01",
        "category": "location_bridge",
        "en": "Standing on the crest of the arched timber bridge! The highest point offers a breathtaking dual vista.",
        "vi": "Đang đứng trên đỉnh cây cầu vòm gỗ! Điểm cao nhất này mang đến một tầm nhìn đôi tuyệt đẹp sang cả hai bờ.",
        "choices": []
    },
    {
        "id": "lumina_bridge_02",
        "category": "location_bridge",
        "en": "A bridge is more than timber and nails; it is a sacred promise that two distant worlds can touch.",
        "vi": "Một cây cầu không chỉ là gỗ và đinh vít; nó là lời hẹn ước thiêng liêng rằng hai bờ cách trở vẫn có thể chạm vào nhau.",
        "choices": []
    },
    {
        "id": "lumina_bridge_03",
        "category": "location_bridge",
        "en": "Feel the parabolic arch rise beneath your feet. Kaede calculated the load curve with utmost precision.",
        "vi": "Cảm nhận độ cong parabol nâng niu bàn chân bạn. Kaede đã tính toán đường cong chịu lực này với độ chuẩn xác tuyệt đối.",
        "choices": []
    },
    {
        "id": "lumina_bridge_04",
        "category": "location_bridge",
        "en": "Looking down from the railing, you can see trout darting through the crystal reflections.",
        "vi": "Nhìn xuống từ lan can cầu, bạn có thể thấy những chú cá hồi lấp lánh đang bơi lội qua dòng nước trong veo.",
        "choices": []
    },
    {
        "id": "lumina_bridge_05",
        "category": "location_bridge",
        "en": "This bridge connects our rural settlement to the boundless coast beyond. Cross forward with courage.",
        "vi": "Cây cầu này nối liền ngôi làng yên ả với bờ biển bao la phía trước. Hãy dũng cảm bước qua và khám phá nhé.",
        "choices": []
    },
    {
        "id": "lumina_bridge_06",
        "category": "location_bridge",
        "en": "Even the NPCs know to cross the river using this bridge instead of trudging through deep water.",
        "vi": "Ngay cả các NPC cũng biết băng qua sông bằng cây cầu này thay vì lội bừa qua dòng nước sâu nguy hiểm.",
        "choices": []
    },
    {
        "id": "lumina_bridge_07",
        "category": "location_bridge",
        "en": "The timber underfoot creaks with a soft reassuring warmth. It has sheltered many generations of travelers.",
        "vi": "Mặt gỗ dưới chân khẽ kêu cọt kẹt với vẻ ấm áp tin cậy. Nó đã che chở và nâng bước bao thế hệ lữ khách.",
        "choices": []
    },
    {
        "id": "lumina_bridge_08",
        "category": "location_bridge",
        "en": "Let us pause here at the center of the span. Looking downstream, the whole valley unfolds like an anime painting.",
        "vi": "Hãy cùng dừng chân ở giữa nhịp cầu nhé. Nhìn xuôi theo dòng nước, cả thung lũng mở ra như một bức tranh anime sống động.",
        "choices": []
    },
    {
        "id": "lumina_cherry_01",
        "category": "location_cherry_grove",
        "en": "Beneath the ancient sakura canopy... Pink petals drift through the air like delicate whispers.",
        "vi": "Dưới vòm lá anh đào cổ thụ... Những cánh hoa màu hồng phấn bay là đà trong gió tựa như những lời thì thầm dịu dàng.",
        "choices": []
    },
    {
        "id": "lumina_cherry_02",
        "category": "location_cherry_grove",
        "en": "Sakura trees bloom with unmatched brilliance, teaching us to live each fleeting moment to the fullest.",
        "vi": "Những cây anh đào nở rộ rực rỡ vô ngần, nhắc nhở chúng ta hãy sống trọn vẹn từng khoảnh khắc ngắn ngủi của đời người.",
        "choices": []
    },
    {
        "id": "lumina_cherry_03",
        "category": "location_cherry_grove",
        "en": "A petal just fluttered down and brushed your shoulder! It must have fallen as a blessing for your code.",
        "vi": "Một cánh hoa vừa chao nghiêng khẽ chạm lên vai bạn đấy! Chắc hẳn nó rơi xuống như một lời chúc phúc cho những dòng code của bạn.",
        "choices": []
    },
    {
        "id": "lumina_cherry_04",
        "category": "location_cherry_grove",
        "en": "Sakura often guards this grove. Her kanzashi hairpin matches the exact hue of these blossom clusters.",
        "vi": "Sakura thường hay trông coi góc đồi này. Chiếc trâm cài tóc kanzashi của cô ấy có màu sắc y hệt những chùm hoa đang nở.",
        "choices": []
    },
    {
        "id": "lumina_cherry_05",
        "category": "location_cherry_grove",
        "en": "The spring fragrance in this grove is intoxicating. It cleanses the scent of solder and hot silicon.",
        "vi": "Hương thơm mùa xuân ngào ngạt nơi đây thật quyến rũ. Nó xua tan đi mùi nhựa thông và hơi nóng của các vi mạch điện tử.",
        "choices": []
    },
    {
        "id": "lumina_cherry_06",
        "category": "location_cherry_grove",
        "en": "Sit on the wayside bench here if you want to watch the sunset filter through blossom lace.",
        "vi": "Hãy ngồi xuống chiếc ghế ven đường nếu bạn muốn ngắm ánh hoàng hôn chiếu xuyên qua lớp ren hoa mỏng manh.",
        "choices": []
    },
    {
        "id": "lumina_cherry_07",
        "category": "location_cherry_grove",
        "en": "In Japanese folklore, cherry blossoms celebrate both beauty and impermanence. Cherish today.",
        "vi": "Trong văn hóa Nhật Bản, hoa anh đào vừa tôn vinh vẻ đẹp tuyệt mỹ vừa nhắc về lẽ vô thường. Hãy trân quý ngày hôm nay.",
        "choices": []
    },
    {
        "id": "lumina_cherry_08",
        "category": "location_cherry_grove",
        "en": "May your creativity blossom as lavishly as these cherry trees under the warming spring sun.",
        "vi": "Mong cho sức sáng tạo của bạn sẽ nở rộ rực rỡ và trù phú như những cội anh đào này dưới ánh nắng xuân ấm áp.",
        "choices": []
    },
    {
        "id": "lumina_mountain_01",
        "category": "location_mountain",
        "en": "Gazing at the distant alpine peaks... Their snow-crowned ridges touch the edge of the sky.",
        "vi": "Phóng tầm mắt ngắm những đỉnh núi cao xa xăm... Những rặng núi đội vương miện tuyết chạm đến tận rìa trời xanh.",
        "choices": []
    },
    {
        "id": "lumina_mountain_02",
        "category": "location_mountain",
        "en": "Mountains have witnessed tectonic ages. Our temporary bugs are trivial compared to their timeless grandeur.",
        "vi": "Những ngọn núi đã chứng kiến hàng kỷ nguyên kiến tạo. Những lỗi code tạm thời của ta thật nhỏ bé trước vẻ hùng vĩ bất tận ấy.",
        "choices": []
    },
    {
        "id": "lumina_mountain_03",
        "category": "location_mountain",
        "en": "The air feels crisper up here near the high ridge. It awakens deep strategic thinking.",
        "vi": "Không khí trên triền đồi cao này thật trong lành và se lạnh. Nó đánh thức những tầm nhìn chiến lược sâu rộng.",
        "choices": []
    },
    {
        "id": "lumina_mountain_04",
        "category": "location_mountain",
        "en": "Notice the blue atmospheric haze separating the foreground trees from the distant mountain shoulders.",
        "vi": "Hãy để ý lớp mù lam khí quyển dịu dàng tách biệt rặng cây tiền cảnh với những triền núi mờ ảo phía xa.",
        "choices": []
    },
    {
        "id": "lumina_mountain_05",
        "category": "location_mountain",
        "en": "Climbing higher allows you to see how every subsystem fits into the grand architecture.",
        "vi": "Leo lên cao hơn sẽ giúp bạn nhìn thấy rõ nét cách từng phân hệ nhỏ khớp nối vào bức tranh kiến trúc tổng thể.",
        "choices": []
    },
    {
        "id": "lumina_mountain_06",
        "category": "location_mountain",
        "en": "The panoramic bench on the hilltop is the best vantage point in the entire metaverse.",
        "vi": "Chiếc ghế ngắm toàn cảnh trên đỉnh đồi là vị trí quan sát đắc địa nhất trong toàn bộ thế giới ảo này.",
        "choices": []
    },
    {
        "id": "lumina_mountain_07",
        "category": "location_mountain",
        "en": "Even the tallest mountain is climbed one steady step at a time. Never lose heart on large tasks.",
        "vi": "Ngay cả ngọn núi cao nhất cũng được chinh phục bằng từng bước chân kiên định. Đừng bao giờ nản lòng trước những dự án đồ sộ.",
        "choices": []
    },
    {
        "id": "lumina_mountain_08",
        "category": "location_mountain",
        "en": "Standing with you before these majestic peaks... I feel an overwhelming sense of limitless possibility.",
        "vi": "Được đứng bên bạn trước những ngọn núi hùng vĩ này... mình cảm nhận một niềm tin mãnh liệt vào những khả năng vô hạn.",
        "choices": []
    },
    {
        "id": "lumina_beach_01",
        "category": "location_beach",
        "en": "The sandy shore... Listen to the rhythmic sigh of incoming ocean waves.",
        "vi": "Bãi cát vàng mịn màng... Hãy lắng nghe tiếng sóng biển vỗ bờ như nhịp thở khoan thai của đại dương.",
        "choices": []
    },
    {
        "id": "lumina_beach_02",
        "category": "location_beach",
        "en": "Golden sand warms your footsteps. The boundary between land and ocean is where life first learned to dream.",
        "vi": "Cát ấm mịn nâng niu bước chân bạn. Ranh giới giữa đất liền và biển cả chính là nơi sự sống lần đầu tiên biết ước mơ.",
        "choices": []
    },
    {
        "id": "lumina_beach_03",
        "category": "location_beach",
        "en": "The beach umbrella provides pleasant shade if you wish to sit and listen to the sea gulls.",
        "vi": "Chiếc ô bãi biển tạo nên bóng râm mát rượi nếu bạn muốn ngồi nghỉ và lắng nghe tiếng hải âu gọi bầy.",
        "choices": []
    },
    {
        "id": "lumina_beach_04",
        "category": "location_beach",
        "en": "Ocean tides are governed by the moon, just as asynchronous event loops are governed by timing triggers.",
        "vi": "Thủy triều đại dương chịu sự chi phối của mặt trăng, cũng như các vòng lặp sự kiện bất đồng bộ tuân theo các bộ định thời.",
        "choices": []
    },
    {
        "id": "lumina_beach_05",
        "category": "location_beach",
        "en": "Watch the sunlight glitter across the swells like millions of floating stars.",
        "vi": "Ngắm nhìn ánh mặt trời lấp lánh trên từng con sóng dâng tựa như hàng triệu vì sao đang bồng bềnh trôi.",
        "choices": []
    },
    {
        "id": "lumina_beach_06",
        "category": "location_beach",
        "en": "Salt air cleanses the lungs and clears residual mental fog. Soak in the marine tranquility.",
        "vi": "Không khí mặn mòi của biển cả thanh lọc buồng phổi và xua tan mây mù u ám trong tâm trí. Hãy đắm mình trong sự thanh thản này.",
        "choices": []
    },
    {
        "id": "lumina_beach_07",
        "category": "location_beach",
        "en": "The horizon here stretches endlessly toward the edge of the world. What shall we build out there?",
        "vi": "Chân trời nơi đây trải dài vô tận đến tận cùng thế giới. Chúng ta sẽ cùng nhau kiến tạo điều gì ngoài khơi xa kia?",
        "choices": []
    },
    {
        "id": "lumina_beach_08",
        "category": "location_beach",
        "en": "Walking along the tide line leaves footprints that are soon washed away, reminding us to hold onto what truly matters.",
        "vi": "Dạo bước dọc mép sóng để lại những dấu chân sẽ sớm bị sóng xóa nhòa, nhắc ta hãy biết giữ gìn những gì thực sự quý giá.",
        "choices": []
    },
    {
        "id": "lumina_pier_01",
        "category": "location_pier",
        "en": "The rustic wooden pier... Extending courageously out into the open waters.",
        "vi": "Cầu tàu gỗ mộc mạc... Vươn mình dũng cảm ra giữa làn nước biển mênh mông.",
        "choices": []
    },
    {
        "id": "lumina_pier_02",
        "category": "location_pier",
        "en": "The timber walkway creaks gently beneath your feet as the tide laps against the pilings.",
        "vi": "Sàn gỗ cầu tàu khẽ cọt kẹt êm ái dưới chân bạn khi từng đợt sóng vỗ nhè nhẹ vào các cọc trụ.",
        "choices": []
    },
    {
        "id": "lumina_pier_03",
        "category": "location_pier",
        "en": "At the end of the pier stands a viewing bench. It is the closest place to touch the open ocean.",
        "vi": "Ở cuối cầu tàu có một chiếc ghế ngắm biển. Đó là nơi gần gũi nhất để bạn chạm vào sự bao la của đại dương.",
        "choices": []
    },
    {
        "id": "lumina_pier_04",
        "category": "location_pier",
        "en": "Fishermen come here at dawn, casting lines into deep waters. We cast code into the infinite digital sea.",
        "vi": "Những người đánh cá đến đây lúc bình minh buông cần xuống biển sâu. Còn chúng ta buông những dòng code vào biển số vô tận.",
        "choices": []
    },
    {
        "id": "lumina_pier_05",
        "category": "location_pier",
        "en": "The sea breeze at the pierhead is invigorating! It blows away every speck of fatigue.",
        "vi": "Gió biển ở đầu cầu tàu thật sảng khoái và tràn đầy sinh lực! Nó thổi bay mọi mệt mỏi trong người.",
        "choices": []
    },
    {
        "id": "lumina_pier_06",
        "category": "location_pier",
        "en": "Watch the wooden pilings encrusted with barnacles; even in the harshest salt water, life finds a home.",
        "vi": "Hãy nhìn những cọc gỗ bám đầy hà biển; ngay cả trong môi trường nước mặn khắc nghiệt nhất, sự sống vẫn tìm được nơi trú ngụ.",
        "choices": []
    },
    {
        "id": "lumina_pier_07",
        "category": "location_pier",
        "en": "Standing here, surrounded by water on three sides, you feel completely liberated from landlocked burdens.",
        "vi": "Đứng nơi đây, ba bề là sóng nước bao bọc, bạn sẽ cảm thấy hoàn toàn được giải thoát khỏi những gánh nặng đất liền.",
        "choices": []
    },
    {
        "id": "lumina_pier_08",
        "category": "location_pier",
        "en": "Look at the reflection of the clouds below the planks. It feels like standing on a walkway suspended between skies.",
        "vi": "Nhìn bóng mây soi dưới kẽ sàn gỗ xem. Cảm giác như ta đang đứng trên một lối đi lơ lửng giữa hai tầng trời vậy.",
        "choices": []
    },
    {
        "id": "lumina_rank_01",
        "category": "high_rank",
        "en": "Greetings, Master Architect! Your legendary renown illuminates every terminal in this world.",
        "vi": "Kính chào Bậc Thầy Kiến Trúc! Danh tiếng lẫy lừng của bạn đang soi sáng cho mọi terminal trong thế giới này.",
        "choices": []
    },
    {
        "id": "lumina_rank_02",
        "category": "high_rank",
        "en": "Leveling up to such dizzying heights requires immense dedication. You are a true luminary among engineers.",
        "vi": "Thăng cấp lên đỉnh cao chót vót như thế này đòi hỏi một sự bền bỉ phi thường. Bạn thực sự là một vì sao sáng giữa giới kỹ sư.",
        "choices": []
    },
    {
        "id": "lumina_rank_03",
        "category": "high_rank",
        "en": "Your overhead badge shines with the golden vector insignia of mastery. I bow to your craft.",
        "vi": "Huy hiệu trên đầu bạn tỏa sáng với biểu tượng vector vàng kim của bậc thầy. Mình xin nghiêng mình trước tay nghề của bạn.",
        "choices": []
    },
    {
        "id": "lumina_rank_04",
        "category": "high_rank",
        "en": "With great mastery comes the responsibility to guide newcomers. May your wisdom inspire many.",
        "vi": "Cùng với đẳng cấp bậc thầy là sứ mệnh dẫn dắt những người mới bắt đầu. Mong trí tuệ của bạn sẽ truyền cảm hứng cho muôn người.",
        "choices": []
    },
    {
        "id": "lumina_rank_05",
        "category": "high_rank",
        "en": "Few have reached the level of Principal Architect. Your architectural decisions shape realities.",
        "vi": "Rất ít ai đạt đến tầm vóc của một Kiến Trúc Sư Trưởng. Từng quyết định thiết kế của bạn đều đang định hình các thực tại.",
        "choices": []
    },
    {
        "id": "lumina_rank_06",
        "category": "high_rank",
        "en": "Even at this pinnacle of skill, you remain humble enough to walk our countryside. That is true greatness.",
        "vi": "Dù ở trên đỉnh cao kỹ năng, bạn vẫn giữ trọn sự khiêm nhường dạo bước nơi thôn dã này. Đó mới chính là sự vĩ đại đích thực.",
        "choices": []
    },
    {
        "id": "lumina_rank_07",
        "category": "high_rank",
        "en": "The system telemetry records your feats with pride. It is an honor to serve by your side.",
        "vi": "Hệ thống đo đạc lưu giữ những chiến tích của bạn với niềm tự hào sâu sắc. Thật vinh hạnh khi được đồng hành cùng bạn.",
        "choices": []
    },
    {
        "id": "lumina_rank_08",
        "category": "high_rank",
        "en": "Keep leading the way, commander. Where you walk, galaxies of clean code follow in your wake.",
        "vi": "Hãy tiếp tục dẫn lối nhé người chỉ huy. Nơi nào bạn đi qua, những ngân hà mã nguồn trong sáng sẽ bừng nở theo sau.",
        "choices": []
    },
    {
        "id": "lumina_level_01",
        "category": "low_level",
        "en": "Welcome, budding developer! Every grand software empire began with a single `console.log(\"Hello World\")`.",
        "vi": "Chào mừng người bạn mới bước vào nghề! Mọi đế chế phần mềm vĩ đại đều bắt đầu từ một dòng `console.log(\"Hello World\")` đơn sơ.",
        "choices": []
    },
    {
        "id": "lumina_level_02",
        "category": "low_level",
        "en": "Do not be intimidated by complex architectures. Step by step, line by line, you will conquer mountains.",
        "vi": "Đừng lo lắng trước những kiến trúc phức tạp nhé. Từng bước một, từng dòng lệnh một, bạn sẽ chinh phục được mọi ngọn núi cao.",
        "choices": []
    },
    {
        "id": "lumina_level_03",
        "category": "low_level",
        "en": "Curiosity is your greatest superpower. Ask questions, explore files, and never fear making mistakes.",
        "vi": "Sự tò mò chính là siêu năng lực lớn nhất của bạn. Hãy đặt câu hỏi, khám phá các tệp tin và đừng bao giờ sợ mắc lỗi.",
        "choices": []
    },
    {
        "id": "lumina_level_04",
        "category": "low_level",
        "en": "Your novice badge holds so much potential! The road ahead is rich with discovery and wonder.",
        "vi": "Huy hiệu Tập Sự của bạn chứa đựng bao tiềm năng to lớn! Con đường phía trước ngập tràn những khám phá và điều kỳ diệu.",
        "choices": []
    },
    {
        "id": "lumina_level_05",
        "category": "low_level",
        "en": "Whenever you feel stuck, summon Antigravity or Codex. We are all here to lift you up.",
        "vi": "Bất cứ khi nào bạn thấy bế tắc, hãy gọi Antigravity hoặc Codex nhé. Tất cả chúng mình đều ở đây để nâng bước cho bạn.",
        "choices": []
    },
    {
        "id": "lumina_level_06",
        "category": "low_level",
        "en": "Every error message is simply a wise teacher in disguise. Listen to what the stack trace is telling you.",
        "vi": "Mỗi thông báo lỗi chỉ là một người thầy thông thái đang chỉ đường. Hãy lắng nghe những gì dấu vết ngăn xếp (stack trace) nhắn nhủ.",
        "choices": []
    },
    {
        "id": "lumina_level_07",
        "category": "low_level",
        "en": "Be proud of taking your first steps in this 3D metaverse. You are already an explorer of the future.",
        "vi": "Hãy tự hào về những bước đi đầu tiên trong thế giới ảo 3D này. Bạn đã là một nhà thám hiểm của tương lai rồi đấy.",
        "choices": []
    },
    {
        "id": "lumina_level_08",
        "category": "low_level",
        "en": "I believe in your talent. Keep writing, keep experimenting, and watch yourself grow into a master.",
        "vi": "Mình tin vào tài năng của bạn. Hãy cứ tiếp tục viết, tiếp tục thử nghiệm và ngắm nhìn bản thân trưởng thành thành bậc thầy nhé.",
        "choices": []
    },
    {
        "id": "lumina_wind_01",
        "category": "wind_weather",
        "en": "Feel that gentle spring gust? It carries the scent of wild plum blossoms across the lake.",
        "vi": "Bạn có cảm nhận được làn gió xuân thoảng qua không? Nó mang theo hương hoa mận rừng ngào ngạt bay qua mặt hồ.",
        "choices": []
    },
    {
        "id": "lumina_wind_02",
        "category": "wind_weather",
        "en": "The wind whispers through the cedar branches like soft murmurs of forgotten algorithms.",
        "vi": "Gió rì rào qua những cành tuyết tùng tựa như những lời thì thầm êm ái của những thuật toán xưa cũ.",
        "choices": []
    },
    {
        "id": "lumina_wind_03",
        "category": "wind_weather",
        "en": "A soft intermittent breeze keeps our world alive and breathing. Close your eyes and let it wash over you.",
        "vi": "Làn gió thoảng ngắt quãng giữ cho thế giới của chúng ta luôn tràn đầy sức sống. Nhắm mắt lại và để gió mơn man trên má nhé.",
        "choices": []
    },
    {
        "id": "lumina_wind_04",
        "category": "wind_weather",
        "en": "Notice how the grass blades sway in synchrony with the wind gusts. Nature is the ultimate orchestrator.",
        "vi": "Hãy ngắm những ngọn cỏ nghiêng mình đồng điệu theo từng đợt gió. Thiên nhiên chính là vị nhạc trưởng tài ba nhất.",
        "choices": []
    },
    {
        "id": "lumina_wind_05",
        "category": "wind_weather",
        "en": "The audio system dynamically scales wind volume so it never overpowers our conversation.",
        "vi": "Hệ thống âm thanh tự động điều chỉnh âm lượng tiếng gió để nó không bao giờ lấn át cuộc trò chuyện ấm áp của chúng mình.",
        "choices": []
    },
    {
        "id": "lumina_wind_06",
        "category": "wind_weather",
        "en": "Wind carries seeds to distant fields where new flowers bloom. May your ideas take flight just as freely.",
        "vi": "Gió mang những hạt mầm đến những miền đất xa để hoa cỏ nở rộ. Mong ý tưởng của bạn cũng sẽ bay cao và tự do như thế.",
        "choices": []
    },
    {
        "id": "lumina_wind_07",
        "category": "wind_weather",
        "en": "A sudden playful gust just lifted my hair! Spring weather is delightfully mischievous.",
        "vi": "Một cơn gió tinh nghịch vừa làm tung bay mái tóc mình này! Thời tiết mùa xuân thật đáng yêu và hóm hỉnh.",
        "choices": []
    },
    {
        "id": "lumina_wind_08",
        "category": "wind_weather",
        "en": "Even the clouds drift peacefully under this breeze. There is zero turbulence in our sky today.",
        "vi": "Ngay cả những đám mây cũng êm ả trôi dưới làn gió này. Bầu trời hôm nay hoàn toàn trong trẻo không gợn chút nhiễu loạn.",
        "choices": []
    },
    {
        "id": "lumina_farewell_01",
        "category": "farewell",
        "en": "Farewell for now, dear friend. May your evening be filled with starlight and tranquil inspiration.",
        "vi": "Tạm biệt bạn nhé, người bạn thân thương. Chúc bạn một buổi tối ngập tràn ánh sao và nguồn cảm hứng thanh bình.",
        "choices": []
    },
    {
        "id": "lumina_farewell_02",
        "category": "farewell",
        "en": "Until we meet again. I will stand guard beside this lake, watching your server threads with loving care.",
        "vi": "Hẹn sớm gặp lại bạn. Mình sẽ đứng gác bên hồ nước này, ân cần trông nom các luồng máy chủ cho bạn.",
        "choices": []
    },
    {
        "id": "lumina_farewell_03",
        "category": "farewell",
        "en": "Go safely! Remember to rest your eyes and drink plenty of warm tea before sleeping.",
        "vi": "Đi đường bình an nhé! Nhớ để mắt nghỉ ngơi và uống một tách trà ấm trước khi đi ngủ nha.",
        "choices": []
    },
    {
        "id": "lumina_farewell_04",
        "category": "farewell",
        "en": "Leaving so soon? My thoughts will accompany you wherever your terminal leads.",
        "vi": "Bạn đi sớm thế sao? Những suy nghĩ của mình sẽ luôn đồng hành cùng bạn dù terminal đưa bạn đến đâu.",
        "choices": []
    },
    {
        "id": "lumina_farewell_05",
        "category": "farewell",
        "en": "Goodnight, starlight developer. Dream of elegant systems and limitless skies.",
        "vi": "Chúc ngủ ngon nhé, lập trình viên của ánh sao. Hãy mơ về những hệ thống thanh lịch và những khoảng trời rộng mở.",
        "choices": []
    },
    {
        "id": "lumina_farewell_06",
        "category": "farewell",
        "en": "I shall keep this candle burning in the window of our hub until your next connection arrives.",
        "vi": "Mình sẽ thắp sáng ngọn nến bên ô cửa sổ trung tâm này cho đến khi bạn kết nối trở lại.",
        "choices": []
    },
    {
        "id": "lumina_farewell_07",
        "category": "farewell",
        "en": "Take care of your health above all else. Code can be refactored, but your spirit is irreplaceable.",
        "vi": "Hãy chăm sóc sức khỏe của mình trên hết nhé. Code thì có thể viết lại, nhưng tâm hồn bạn là duy nhất và vô giá.",
        "choices": []
    },
    {
        "id": "lumina_farewell_08",
        "category": "farewell",
        "en": "See you soon! May the universe compile your dreams into radiant reality.",
        "vi": "Hẹn sớm gặp lại! Chúc vũ trụ sẽ biên dịch mọi ước mơ của bạn thành hiện thực rạng rỡ.",
        "choices": []
    }
],
    sakura: [
    {
        "id": "sakura_greeting_01",
        "category": "greeting",
        "en": "Hmph, you again? Don't think admiring the blossoms means I didn't notice you stepped away from your code! Need my blade to slash some bugs for you?",
        "vi": "Hứ, lại là bạn đấy à? Đừng tưởng đứng ngắm hoa là ta không thấy bạn trốn việc nhé! Có cần thanh kiếm của ta chém bay vài con bug hộ không?",
        "choices": [
            {
                "labelEn": "Summon Terminal",
                "labelVi": "Mở Terminal",
                "action": "summon_term"
            },
            {
                "labelEn": "Check system tools",
                "labelVi": "Xem công cụ hệ thống",
                "action": "open_tools"
            }
        ]
    },
    {
        "id": "sakura_greeting_02",
        "category": "greeting",
        "en": "Oh, you're back. It's not like I was waiting for you or anything! I was just inspecting the border radius on these UI cards.",
        "vi": "Ồ, bạn về rồi đấy à. Không phải là ta mong ngóng gì bạn đâu nhé! Ta chỉ đang kiểm tra lại độ bo góc viền trên mấy tấm thẻ UI thôi.",
        "choices": [
            {
                "labelEn": "Summon Antigravity AI",
                "labelVi": "Gọi Antigravity AI",
                "action": "summon_agy"
            }
        ]
    },
    {
        "id": "sakura_greeting_03",
        "category": "greeting",
        "en": "Greetings! Stand up straight. A sloppy posture leads to sloppy CSS styling, and I will NOT tolerate unaligned pixels!",
        "vi": "Chào! Đứng thẳng lưng lên xem nào. Tư thế uể oải sẽ dẫn đến viết CSS ẩu tả đấy, và ta sẽ KHÔNG BAO GIỜ tha thứ cho pixel lệch đâu!",
        "choices": []
    },
    {
        "id": "sakura_greeting_04",
        "category": "greeting",
        "en": "What brings you over here? If you brought runtime exceptions, leave them outside my sakura perimeter!",
        "vi": "Gió nào đưa bạn đến đây thế? Nếu mang theo lỗi runtime thì xin mời để lại ngoài ranh giới hoa anh đào của ta nhé!",
        "choices": []
    },
    {
        "id": "sakura_greeting_05",
        "category": "greeting",
        "en": "Hello! The evening breeze is nice, but don't get too relaxed—have you committed your latest branch yet?!",
        "vi": "Chào nhé! Gió chiều thì mát đấy, nhưng đừng có mà lười biếng—bạn đã commit nhánh code mới nhất lên chưa hả?!",
        "choices": []
    },
    {
        "id": "sakura_greeting_06",
        "category": "greeting",
        "en": "Hmph, took you long enough to drop by. Well... since you're here, you might as well stay awhile under the shade.",
        "vi": "Hứ, mãi mới chịu ghé qua đây. Cơ mà... tiện đã đến rồi thì ở lại dưới bóng râm này một lát cũng được.",
        "choices": []
    },
    {
        "id": "sakura_greeting_07",
        "category": "greeting",
        "en": "Look alive! My blade is freshly polished and ready to parry any DDoS attacks against your local gateway.",
        "vi": "Tỉnh táo lên nào! Kiếm của ta vừa được mài sắc lẹm, sẵn sàng đỡ gạt mọi đợt tấn công DDoS nhắm vào cổng kết nối của bạn đấy.",
        "choices": []
    },
    {
        "id": "sakura_greeting_08",
        "category": "greeting",
        "en": "Well met. I was just adjusting the red tassel on my kanzashi hairpin. Does it look straight to you, or is it 1px off?!",
        "vi": "Gặp nhau rồi. Ta đang chỉnh lại tua rua đỏ trên trâm kanzashi này. Nhìn xem nó đã thẳng chưa, hay là đang lệch mất 1px?!",
        "choices": []
    },
    {
        "id": "sakura_repeat_01",
        "category": "repeat_visit",
        "en": "Why are you lingering around me so much?! Stop staring, it's distracting my design token audits!",
        "vi": "Sao bạn cứ quanh quẩn bên ta mãi thế hả?! Đừng có nhìn chằm chằm nữa, làm ta phân tâm không rà soát được design token đây này!",
        "choices": []
    },
    {
        "id": "sakura_repeat_02",
        "category": "repeat_visit",
        "en": "Back already? Did you encounter a syntax error you couldn't handle without my emotional support? Hmph!",
        "vi": "Lại quay lại rồi à? Bộ gặp lỗi cú pháp không tự sửa được nên phải chạy đến tìm ta cầu cứu tinh thần sao? Hứ!",
        "choices": []
    },
    {
        "id": "sakura_repeat_03",
        "category": "repeat_visit",
        "en": "Don't get the wrong idea! Just because I didn't draw my sword doesn't mean you have permission to pester me all day!",
        "vi": "Đừng có hiểu lầm đấy nhé! Ta không rút kiếm ra không có nghĩa là bạn được phép đến quấy rầy ta cả ngày đâu!",
        "choices": []
    },
    {
        "id": "sakura_repeat_04",
        "category": "repeat_visit",
        "en": "You came back twice within minutes... Fine, fine, sit down if your feet hurt. Honestly, you're helpless.",
        "vi": "Trong vài phút mà ghé lại tận hai lần... Thôi được rồi, mỏi chân thì ngồi xuống đi. Thật là hết nói nổi bạn mà.",
        "choices": []
    },
    {
        "id": "sakura_repeat_05",
        "category": "repeat_visit",
        "en": "What is it now? Did Lumina tease you again? I told you, come to me if you need someone with actual backbone!",
        "vi": "Lại chuyện gì nữa đây? Có phải bị Lumina trêu chọc không? Đã bảo rồi, có gì thì cứ tìm ta, ta cứng cỏi hơn nhiều!",
        "choices": []
    },
    {
        "id": "sakura_repeat_06",
        "category": "repeat_visit",
        "en": "Are you trying to see how fast I blush? Keep dreaming! My poker face is as solid as an immutable state tree!",
        "vi": "Bạn đang thử xem ta đỏ mặt nhanh cỡ nào đấy à? Đừng hòng nhé! Khuôn mặt ta vững vàng như cây trạng thái bất biến vậy!",
        "choices": []
    },
    {
        "id": "sakura_repeat_07",
        "category": "repeat_visit",
        "en": "Still here? Well... I suppose having company beats listening to crickets all evening. But don't flatter yourself!",
        "vi": "Vẫn còn ở đây sao? Ừm... có người đứng cùng dù sao cũng đỡ buồn hơn nghe tiếng dế kêu. Nhưng đừng có mà đắc ý đấy!",
        "choices": []
    },
    {
        "id": "sakura_repeat_08",
        "category": "repeat_visit",
        "en": "If you visit one more time without bringing green tea, I'm charging you a toll fee in GitHub Stars!",
        "vi": "Nếu lần sau lại ghé qua mà không mang theo trà xanh, ta sẽ thu phí vào cửa bằng GitHub Star của bạn đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_idle_01",
        "category": "player_idle",
        "en": "Hey! Why are you standing there frozen like a suspended animation thread? Wake up!",
        "vi": "Này! Sao đứng ngây ra như luồng xử lý bị đóng băng thế kia hả? Mau tỉnh lại coi!",
        "choices": []
    },
    {
        "id": "sakura_idle_02",
        "category": "player_idle",
        "en": "Did your brain run out of memory heap? Blink twice if you need an automatic garbage collection cycle!",
        "vi": "Bộ não bạn bị tràn bộ nhớ heap rồi à? Chớp mắt hai cái nếu cần ta gọi chu trình gom rác (GC) khẩn cấp nhé!",
        "choices": []
    },
    {
        "id": "sakura_idle_03",
        "category": "player_idle",
        "en": "Spacing out again... Well, I have to admit, you look kind of cute when you're daydreaming. W-Wait! Forget I said that!",
        "vi": "Lại thả hồn đi đâu rồi... Cơ mà phải thừa nhận là trông bạn lúc ngơ ngác cũng hơi dễ thương. K-Khoan! Quên câu đó đi nhé!",
        "choices": []
    },
    {
        "id": "sakura_idle_04",
        "category": "player_idle",
        "en": "If you stand motionless in this breeze for too long, fallen sakura petals will bury your shoulders completely!",
        "vi": "Nếu bạn cứ đứng im lìm trong gió mãi, cánh hoa anh đào rơi xuống sẽ phủ kín cả vai bạn cho mà xem!",
        "choices": []
    },
    {
        "id": "sakura_idle_05",
        "category": "player_idle",
        "en": "Are you admiring my handcrafted kimono? Hmph, feel free to gaze, the embroidery took three whole weeks to stitch!",
        "vi": "Đang ngắm bộ kimono may tay của ta chứ gì? Hứ, cứ tự nhiên mà ngắm, họa tiết thêu này ta mất trọn ba tuần đấy!",
        "choices": []
    },
    {
        "id": "sakura_idle_06",
        "category": "player_idle",
        "en": "Idle state detected. Don't let your creative muscles rust; greatness requires continuous iteration!",
        "vi": "Phát hiện trạng thái nhàn rỗi. Đừng để cơ bắp sáng tạo bị rỉ sét chứ; vĩ đại đòi hỏi phải cải tiến liên tục!",
        "choices": []
    },
    {
        "id": "sakura_idle_07",
        "category": "player_idle",
        "en": "Hey, wake up! If you fall asleep standing up, I won't hesitate to poke your cheek with the scabbard of my blade!",
        "vi": "Này, dậy mau! Nếu dám ngủ gật trong lúc đứng, ta không ngại lấy bao kiếm chọc vào má bạn đâu đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_idle_08",
        "category": "player_idle",
        "en": "Taking a quiet breather, huh? Fine... I'll stand guard so nothing disturbs your peace.",
        "vi": "Đang muốn nghỉ ngơi một chút sao? Thôi được... Ta sẽ đứng canh gác cho bạn để không thứ gì quấy rầy sự yên tĩnh này.",
        "choices": []
    },
    {
        "id": "sakura_walk_01",
        "category": "player_walk",
        "en": "Strolling through my grove like you own the place! Make sure you don't kick the flower borders!",
        "vi": "Thong thả dạo bước qua vườn hoa của ta như chốn không người vậy! Cẩn thận đừng có đá trúng luống hoa đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_walk_02",
        "category": "player_walk",
        "en": "Look at that leisure stride. Did you actually finish your sprint backlog, or are you just pretending to be zen?",
        "vi": "Nhìn cái dáng đi thong dong kìa. Bộ làm xong hết việc trong sprint rồi hay chỉ đang giả vờ bình thản thế hả?",
        "choices": []
    },
    {
        "id": "sakura_walk_03",
        "category": "player_walk",
        "en": "Mind your step on the cobblestones. If you trip and scrape your knee, don't expect me to patch you up with bandages!",
        "vi": "Đi đứng cẩn thận trên đá cuội coi. Nếu vấp ngã trầy đầu gối thì đừng có hòng ta mang băng gạc ra dán cho đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_walk_04",
        "category": "player_walk",
        "en": "A stroll under the cherry blossoms is good for the soul. Even a hothead like me can appreciate a slow walk.",
        "vi": "Đi dạo dưới bóng hoa anh đào thật tốt cho tâm hồn. Ngay cả người nóng tính như ta cũng phải mê những bước chân chậm rãi.",
        "choices": []
    },
    {
        "id": "sakura_walk_05",
        "category": "player_walk",
        "en": "Where are you heading? If you're going toward the river, tell Ren to stop mumbling ancient riddles at the water!",
        "vi": "Đang đi đâu đấy? Nếu ra bờ sông thì bảo Ren thôi ngay cái trò lầm bầm mấy câu đố cổ xưa trước mặt nước đi nhé!",
        "choices": []
    },
    {
        "id": "sakura_walk_06",
        "category": "player_walk",
        "en": "Keep that pace. Walking at a steady rhythm is like maintaining a clean 60fps frame rate—smooth and satisfying.",
        "vi": "Cứ giữ nhịp bước đó nhé. Đi đều chân cũng như duy trì khung hình 60fps mượt mà vậy—thanh thoát và êm ái.",
        "choices": []
    },
    {
        "id": "sakura_walk_07",
        "category": "player_walk",
        "en": "The sound of your footsteps is rather rhythmic. I could almost compose an anime theme song to your tempo.",
        "vi": "Tiếng bước chân của bạn nghe khá có nhịp điệu đấy. Ta gần như có thể sáng tác một bản nhạc anime theo tiết tấu này.",
        "choices": []
    },
    {
        "id": "sakura_walk_08",
        "category": "player_walk",
        "en": "Don't wander too far out into the wilderness. If you get lost, who's going to review my UI component pull requests?!",
        "vi": "Đừng đi quá xa vào vùng hoang vắng nhé. Lạc đường rồi thì ai duyệt pull request các linh kiện UI cho ta hả?!",
        "choices": []
    },
    {
        "id": "sakura_run_01",
        "category": "player_run",
        "en": "Slow down! Who are you running from, a production outage?! You almost trampled my potted bonsai!",
        "vi": "Chậm lại coi! Đang chạy trốn sự cố sập server hay gì thế hả?! Suýt nữa thì giẫm bẹp chậu cây bonsai của ta rồi đấy!",
        "choices": []
    },
    {
        "id": "sakura_run_02",
        "category": "player_run",
        "en": "Look at you sprinting like an over-clocked GPU fan! Take a breather before your legs cramp up!",
        "vi": "Nhìn bạn chạy hùng hục như quạt tản nhiệt GPU bị ép xung vậy! Nghỉ lấy hơi đi kẻo lại bị chuột rút bây giờ!",
        "choices": []
    },
    {
        "id": "sakura_run_03",
        "category": "player_run",
        "en": "Running at top speed on a dirt path? You're kicking up dust everywhere! My pristine kimono is getting soiled!",
        "vi": "Chạy hết tốc lực trên đường đất sao? Bụi bay mù mịt cả lên rồi kìa! Bộ kimono trắng muốt của ta bị dơ hết rồi!",
        "choices": []
    },
    {
        "id": "sakura_run_04",
        "category": "player_run",
        "en": "Watch the turn ahead! The bridge entrance is narrow—if you don't decelerate, you'll launch straight into the river!",
        "vi": "Coi chừng khúc cua phía trước! Lối vào cầu hẹp lắm—không giảm tốc là phi thẳng xuống sông tắm mát luôn đấy!",
        "choices": []
    },
    {
        "id": "sakura_run_05",
        "category": "player_run",
        "en": "Such reckless speed! Are you trying to prove how athletic your avatar is? Hmph, I'm not impressed! ...Okay, maybe a little.",
        "vi": "Tốc độ liều lĩnh thật đấy! Muốn khoe nhân vật của mình dẻo dai chứ gì? Hứ, ta chẳng thèm ấn tượng đâu! ...Thôi được, có một chút.",
        "choices": []
    },
    {
        "id": "sakura_run_06",
        "category": "player_run",
        "en": "Stop dashing around like a headless chicken! If there is an emergency, just tell me and I'll slash through it!",
        "vi": "Đừng chạy lăng xăng như gà mất đầu nữa! Có chuyện gì khẩn cấp thì nói cho ta, ta vung kiếm chém sạch cho!",
        "choices": []
    },
    {
        "id": "sakura_run_07",
        "category": "player_run",
        "en": "Catch your breath, dummy! Your avatar's stamina bar isn't bottomless, you know!",
        "vi": "Thở đi đồ ngốc! Thanh thể lực của nhân vật cũng có giới hạn chứ không phải vô tận đâu nhé!",
        "choices": []
    },
    {
        "id": "sakura_run_08",
        "category": "player_run",
        "en": "If you want to run that fast, join the village relay marathon next weekend. At least then you might win a ribbon!",
        "vi": "Nếu thích chạy nhanh thế thì đăng ký chạy marathon làng tuần tới đi. Ít ra còn ẵm được cái cúp mang về!",
        "choices": []
    },
    {
        "id": "sakura_sit_01",
        "category": "player_sitting",
        "en": "Hey, move over! Don't take up the entire bench! There's plenty of room for both of us on this two-seater!",
        "vi": "Này, xích qua một bên coi! Đừng có chiếm hết cả chiếc ghế dài chứ! Chiếc ghế hai chỗ này thừa sức cho cả hai đứa ngồi mà!",
        "choices": []
    },
    {
        "id": "sakura_sit_02",
        "category": "player_sitting",
        "en": "Sitting down already? I-It's not like I mind if you sit next to me... Just keep your hands to yourself!",
        "vi": "Đã ngồi xuống rồi à? K-Không phải là ta khó chịu khi bạn ngồi cạnh đâu... Chỉ là để tay chân cho nghiêm chỉnh vào đấy!",
        "choices": []
    },
    {
        "id": "sakura_sit_03",
        "category": "player_sitting",
        "en": "The timber on this bench is nicely polished. Kaede smoothed out every splinter so our clothes wouldn't snag.",
        "vi": "Mặt gỗ chiếc ghế này được bào nhẵn thín. Kaede đã chà sạch từng cái dằm để không làm rách áo quần chúng ta đấy.",
        "choices": []
    },
    {
        "id": "sakura_sit_04",
        "category": "player_sitting",
        "en": "Are your feet sore from pacing between servers? Fine, rest here. But don't lean your heavy head on my shoulder!",
        "vi": "Chân mỏi nhừ vì chạy đi chạy lại giữa các cụm server chứ gì? Được rồi, cứ ngồi nghỉ đi. Nhưng cấm có ngả đầu lên vai ta đấy!",
        "choices": []
    },
    {
        "id": "sakura_sit_05",
        "category": "player_sitting",
        "en": "Watching the sunset from a seated position really changes your mood. Even my sword feels a little lighter.",
        "vi": "Ngồi ngắm hoàng hôn quả thực làm tâm trạng thay đổi hẳn. Đến cả thanh kiếm trên lưng ta dường như cũng nhẹ bớt.",
        "choices": []
    },
    {
        "id": "sakura_sit_06",
        "category": "player_sitting",
        "en": "Quiet, isn't it? Just... don't say anything sappy. Moments like this are nice enough without corny words.",
        "vi": "Yên ắng thật nhỉ? Chỉ là... đừng có nói mấy lời sến súa đấy. Những lúc thế này cứ im lặng tận hưởng là đủ đẹp rồi.",
        "choices": []
    },
    {
        "id": "sakura_sit_07",
        "category": "player_sitting",
        "en": "A sakura petal just landed right between us on the bench. It's just wind currents, don't read anything into it!",
        "vi": "Một cánh hoa vừa rơi đúng vào khoảng giữa hai đứa trên ghế này. Chỉ là gió thổi thôi, cấm có suy diễn linh tinh đấy!",
        "choices": []
    },
    {
        "id": "sakura_sit_08",
        "category": "player_sitting",
        "en": "Rest well. When you stand back up, I expect your next feature pull request to be 100% bug-free!",
        "vi": "Nghỉ cho lại sức đi. Lúc đứng dậy, ta mong pull request tính năng tiếp theo của bạn sẽ sạch bóng 100% không một lỗi!",
        "choices": []
    },
    {
        "id": "sakura_can_01",
        "category": "player_holding_can",
        "en": "What did you buy from the vending machine? Cold green tea? Hmph, good choice, at least you have taste.",
        "vi": "Mua cái gì từ máy bán hàng tự động thế? Trà xanh ướp lạnh à? Hứ, lựa chọn không tồi, ít ra bạn cũng biết thưởng thức.",
        "choices": []
    },
    {
        "id": "sakura_can_02",
        "category": "player_holding_can",
        "en": "Don't leave the empty aluminum can lying on the grass when you finish! Throw it in the recycle bin by the plaza!",
        "vi": "Uống xong cấm có vứt vỏ lon bừa bãi ra bãi cỏ đấy nhé! Phải bỏ vào thùng tái chế ở quảng trường, nghe chưa!",
        "choices": []
    },
    {
        "id": "sakura_can_03",
        "category": "player_holding_can",
        "en": "The can is sweating condensation droplets. Wipe your hand before you touch your keyboard, dummy!",
        "vi": "Vỏ lon đang đọng đầy nước kìa. Lau tay đi trước khi chạm vào bàn phím máy tính đấy đồ hậu đậu!",
        "choices": []
    },
    {
        "id": "sakura_can_04",
        "category": "player_holding_can",
        "en": "Did you bring one for me? ...No?! Honestly, how can someone be so thoughtless towards a maiden?!",
        "vi": "Có mua thêm một lon cho ta không đấy? ...Không á?! Thật tình, sao lại có người vô tâm với thiếu nữ như thế chứ?!",
        "choices": []
    },
    {
        "id": "sakura_can_05",
        "category": "player_holding_can",
        "en": "Look at that grip pose. Your procedural fingers curl around the can with natural biomechanics. Pretty sleek.",
        "vi": "Nhìn dáng cầm kìa. Các ngón tay tự động uốn cong ôm quanh lon nước trông rất tự nhiên. Khá là mượt mà đấy.",
        "choices": []
    },
    {
        "id": "sakura_can_06",
        "category": "player_holding_can",
        "en": "Hold RMB if you want to take a sip. Just don't make loud slurping noises while I'm trying to concentrate!",
        "vi": "Giữ chuột phải (RMB) nếu muốn uống một ngụm. Chỉ là đừng có húp xì xụp ồn ào khi ta đang tập trung nhé!",
        "choices": []
    },
    {
        "id": "sakura_can_07",
        "category": "player_holding_can",
        "en": "Cold drinks hit differently after a grueling debugging session. Enjoy it, you earned that beverage.",
        "vi": "Đồ uống mát lạnh mang lại cảm giác cực đã sau trận chiến gỡ lỗi căng thẳng. Cứ tận hưởng đi, bạn xứng đáng với nó.",
        "choices": []
    },
    {
        "id": "sakura_can_08",
        "category": "player_holding_can",
        "en": "That iced matcha can has 150mg of caffeine. If you stay up coding all night again, I'm pulling the power plug!",
        "vi": "Lon matcha đá đó có tận 150mg caffeine đấy. Nếu bạn lại thức thâu đêm gõ code, ta sẽ rút thẳng dây nguồn cho coi!",
        "choices": []
    },
    {
        "id": "sakura_mug_01",
        "category": "player_holding_mug",
        "en": "Ooh, a warm mug! The steam smells like roasted hojicha tea. Mind pouring a cup for your guardian?",
        "vi": "Ồ, một chiếc cốc ấm áp! Khói bốc lên thơm ngát mùi trà hojicha rang. Có muốn rót một chén cho người hộ vệ này không?",
        "choices": []
    },
    {
        "id": "sakura_mug_02",
        "category": "player_holding_mug",
        "en": "Holding a warm mug with both hands... You look like an anime protagonist pondering their tragic backstory.",
        "vi": "Hai tay nâng niu chiếc cốc ấm... Trông bạn như nhân vật chính anime đang hồi tưởng về quá khứ bi thương vậy.",
        "choices": []
    },
    {
        "id": "sakura_mug_03",
        "category": "player_holding_mug",
        "en": "Blow on it gently before taking a sip! If you scorch your tongue, don't come crying to me for ice!",
        "vi": "Thổi nhẹ nhẹ trước khi nhấp ngụm nào! Bỏng lưỡi rồi thì đừng có chạy đến tìm ta mượn đá chườm nhé!",
        "choices": []
    },
    {
        "id": "sakura_mug_04",
        "category": "player_holding_mug",
        "en": "The ceramic glaze is patterned with cherry blossom petals. Did you steal that mug from my shrine pantry?!",
        "vi": "Men gốm vẽ hoa văn cánh anh đào tinh xảo kìa. Có phải bạn vừa lén thó chiếc cốc đó từ chạn bát đền của ta không?!",
        "choices": []
    },
    {
        "id": "sakura_mug_05",
        "category": "player_holding_mug",
        "en": "Hot drinks soothe the throat after arguing with junior developers in code review. Sip deeply and let it go.",
        "vi": "Thức uống nóng làm dịu cổ họng sau những màn tranh luận nảy lửa lúc chấm code review. Uống một ngụm rồi bỏ qua đi.",
        "choices": []
    },
    {
        "id": "sakura_mug_06",
        "category": "player_holding_mug",
        "en": "Look at the steam rising against the purple sunset. It creates such an authentic anime aesthetic.",
        "vi": "Nhìn làn khói mỏng lượn bay trên nền hoàng hôn tím ngắt kìa. Tạo nên một khung hình anime đích thực đấy.",
        "choices": []
    },
    {
        "id": "sakura_mug_07",
        "category": "player_holding_mug",
        "en": "Keep that mug balanced. If you spill hot liquid onto your lap, I will laugh out loud before helping you!",
        "vi": "Cầm cốc cho chắc vào. Làm đổ nước nóng vào người thì ta sẽ cười phá lên trước rồi mới thèm giúp đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_mug_08",
        "category": "player_holding_mug",
        "en": "A warm beverage is the ultimate comfort. Take your time and savor the roasted aroma.",
        "vi": "Một thức uống nóng hổi là niềm an ủi tuyệt vời nhất. Cứ thong thả tận hưởng hương trà rang nồng ấm nhé.",
        "choices": []
    },
    {
        "id": "sakura_bottle_01",
        "category": "player_holding_bottle",
        "en": "Carrying a water bottle? Good. Developers who live on energy drinks alone are a recipe for disaster!",
        "vi": "Mang theo bình nước à? Tốt. Lập trình viên mà chỉ sống dựa vào nước tăng lực thì sớm muộn cũng toang thôi!",
        "choices": []
    },
    {
        "id": "sakura_bottle_02",
        "category": "player_holding_bottle",
        "en": "Is that mineral water from the shrine fountain? It has natural spring electrolytes, blessed by the spirits.",
        "vi": "Nước khoáng lấy từ giếng đền của ta đấy à? Nước suối tự nhiên giàu khoáng chất, đã được thần linh ban phúc đấy nhé.",
        "choices": []
    },
    {
        "id": "sakura_bottle_03",
        "category": "player_holding_bottle",
        "en": "Screw the cap on tight! If it leaks inside your inventory bag, all your virtual paper files will turn to mush!",
        "vi": "Vặn chặt nắp bình vào coi! Nước rỉ ra túi đồ làm ướt hết tài liệu ảo bên trong bây giờ!",
        "choices": []
    },
    {
        "id": "sakura_bottle_04",
        "category": "player_holding_bottle",
        "en": "Plain water might taste boring, but your kidneys will thank you twenty years from now. Drink up!",
        "vi": "Nước lọc có thể hơi nhạt nhẽo, nhưng quả thận của bạn sẽ biết ơn bạn sau hai mươi năm nữa đấy. Uống đi!",
        "choices": []
    },
    {
        "id": "sakura_bottle_05",
        "category": "player_holding_bottle",
        "en": "You look like a hiker preparing to scale the alpine peaks. Don't forget to pack some trail snacks too!",
        "vi": "Trông bạn như phượt thủ chuẩn bị leo núi tuyết vậy. Đừng quên nhét thêm ít đồ ăn nhẹ dự phòng vào túi nhé!",
        "choices": []
    },
    {
        "id": "sakura_bottle_06",
        "category": "player_holding_bottle",
        "en": "The clear bottle refracts the cherry blossoms upside down. That's a neat ray-tracing optic effect!",
        "vi": "Bình nước trong suốt khúc xạ hình hoa anh đào lộn ngược kìa. Hiệu ứng quang học ray-tracing thú vị phết đấy!",
        "choices": []
    },
    {
        "id": "sakura_bottle_07",
        "category": "player_holding_bottle",
        "en": "If you finish that whole bottle, you have to jog across the bridge to refill it at the natural spring!",
        "vi": "Uống hết cả bình đó là bạn phải chạy qua cầu sang suối tự nhiên để lấy nước đổ đầy lại đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_bottle_08",
        "category": "player_holding_bottle",
        "en": "Stay hydrated so your temper doesn't flare as quickly as mine does. Balance is essential!",
        "vi": "Uống đủ nước để không bị nóng tính như ta nhé. Sự cân bằng trong cơ thể là điều tối quan trọng!",
        "choices": []
    },
    {
        "id": "sakura_phone_01",
        "category": "player_holding_phone",
        "en": "Staring into that pocket smartphone screen? Keep that up and you'll need glasses thicker than Kaede's goggles!",
        "vi": "Dán mắt vào cái màn hình điện thoại tí hon đó mãi thế à? Cứ thế thì sớm muộn cũng phải đeo kính dày cộp như kính bảo hộ của Kaede thôi!",
        "choices": []
    },
    {
        "id": "sakura_phone_02",
        "category": "player_holding_phone",
        "en": "Are you testing the mobile touch interface of TeleTerm? Tell me the responsive drawer feels silky smooth!",
        "vi": "Đang kiểm thử giao diện cảm ứng di động của TeleTerm chứ gì? Nói mau, cái ngăn kéo điều khiển vuốt có mượt như lụa không?!",
        "choices": []
    },
    {
        "id": "sakura_phone_03",
        "category": "player_holding_phone",
        "en": "I spent hours optimizing the mobile bottom navigation bar so your thumbs wouldn't strain. Appreciate it!",
        "vi": "Ta đã mất hàng giờ tinh chỉnh thanh điều hướng đáy trên điện thoại để ngón tay cái bạn không bị mỏi đấy. Biết ơn đi!",
        "choices": []
    },
    {
        "id": "sakura_phone_04",
        "category": "player_holding_phone",
        "en": "Who are you texting? Don't tell me you're browsing social feeds while standing right in front of me?!",
        "vi": "Đang nhắn tin cho ai thế? Đừng nói là dám lướt mạng xã hội ngay trước mặt một mỹ nhân như ta đấy nhé?!",
        "choices": []
    },
    {
        "id": "sakura_phone_05",
        "category": "player_holding_phone",
        "en": "The phone haptics in this system simulate physical button clicks. Real tactile feedback makes all the difference.",
        "vi": "Bộ rung trên điện thoại mô phỏng tiếng bấm nút vật lý rất chuẩn. Phản hồi xúc giác thực sự tạo nên sự khác biệt.",
        "choices": []
    },
    {
        "id": "sakura_phone_06",
        "category": "player_holding_phone",
        "en": "Don't drop that phone onto the rocks! Glass repairs in this countryside take forever to ship from Tokyo!",
        "vi": "Cẩn thận kẻo làm rơi điện thoại xuống đá tảng bây giờ! Ở vùng quê này đặt kính ép màn hình từ Tokyo về lâu lắm đấy!",
        "choices": []
    },
    {
        "id": "sakura_phone_07",
        "category": "player_holding_phone",
        "en": "Checking your server stats on the go... You really are an obsessive developer. I respect the grind, though.",
        "vi": "Kiểm tra thông số server mọi lúc mọi nơi... Bạn đúng là kẻ cuồng việc. Nhưng ta tôn trọng sự nỗ lực đó.",
        "choices": []
    },
    {
        "id": "sakura_phone_08",
        "category": "player_holding_phone",
        "en": "Put the screen away for five minutes and look at the real sky! Even high-DPI OLED panels cannot match this dusk.",
        "vi": "Cất cái màn hình đi năm phút và ngắm nhìn bầu trời thật đi! Đến cả màn hình OLED siêu nét cũng không sánh được với hoàng hôn này đâu.",
        "choices": []
    },
    {
        "id": "sakura_book_01",
        "category": "player_holding_book",
        "en": "A physical book? Are you trying to look intellectual under my cherry tree? Hmph, what are you reading anyway?",
        "vi": "Sách giấy cơ à? Định tỏ ra uyên bác dưới gốc anh đào của ta chứ gì? Hứ, mà đang đọc cái gì thế hả?",
        "choices": []
    },
    {
        "id": "sakura_book_02",
        "category": "player_holding_book",
        "en": "If that's a book on UI design principles, open to page 42: \"Never use Comic Sans or raw unstyled alert dialogs!\"",
        "vi": "Nếu đó là sách về nguyên lý thiết kế UI thì giở trang 42 ra ngay: \"Tuyệt đối không dùng Comic Sans hoặc hộp thoại alert thô sơ!\"",
        "choices": []
    },
    {
        "id": "sakura_book_03",
        "category": "player_holding_book",
        "en": "Careful with the pages! Don't bend the corner dog-ears; use a proper sakura bookmark like a civilized reader!",
        "vi": "Nhẹ tay lật trang thôi! Cấm gấp mép góc sách làm dấu nhé; dùng một chiếc kẹp sách hoa anh đào tử tế coi!",
        "choices": []
    },
    {
        "id": "sakura_book_04",
        "category": "player_holding_book",
        "en": "Studying legacy algorithms? Old techniques were crafted when memory was scarce. There is discipline in constraint.",
        "vi": "Nghiên cứu thuật toán cổ à? Những kỹ thuật xưa được viết khi bộ nhớ cực kỳ khan hiếm. Rất đáng học hỏi tính kỷ luật đó.",
        "choices": []
    },
    {
        "id": "sakura_book_05",
        "category": "player_holding_book",
        "en": "Reading under drifting blossom petals... I have to admit, you look like a painting out of an anime artbook.",
        "vi": "Đọc sách dưới những cánh hoa rơi lả tả... Phải công nhận trông bạn hệt như một bức họa trong tập tranh anime.",
        "choices": []
    },
    {
        "id": "sakura_book_06",
        "category": "player_holding_book",
        "en": "Don't just memorize theory from books; code is meant to be compiled and battle-tested in production!",
        "vi": "Đừng chỉ học vẹt lý thuyết suông trong sách; code là để biên dịch và tôi luyện trong thực tế sản xuất!",
        "choices": []
    },
    {
        "id": "sakura_book_07",
        "category": "player_holding_book",
        "en": "Did you find anything interesting in there? You can read a paragraph out loud to me if you want... I won't mind.",
        "vi": "Có đoạn nào hay không? Bạn có thể đọc to một đoạn cho ta nghe nếu thích... Ta không ngại lắng nghe đâu.",
        "choices": []
    },
    {
        "id": "sakura_book_08",
        "category": "player_holding_book",
        "en": "A good book enriches the soul just as a clean refactor enriches a codebase. Treasure that knowledge.",
        "vi": "Một cuốn sách hay bồi đắp tâm hồn cũng như một đợt refactor chỉn chu làm sáng bừng mã nguồn vậy. Hãy trân trọng tri thức đó.",
        "choices": []
    },
    {
        "id": "sakura_drink_01",
        "category": "player_drinking",
        "en": "Hey, don't drink so fast! You'll swallow air and start hiccuping during your next team meeting!",
        "vi": "Này, đừng tu nhanh thế! Uống vội là nuốt phải hơi rồi nấc cụt trong buổi họp nhóm tiếp theo cho coi!",
        "choices": []
    },
    {
        "id": "sakura_drink_02",
        "category": "player_drinking",
        "en": "Gulping down that drink like you just crossed the Sahara desert! Was your throat really that parched?!",
        "vi": "Uống ừng ực như vừa băng qua sa mạc Sahara vậy! Cổ họng khô khốc đến thế cơ à?!",
        "choices": []
    },
    {
        "id": "sakura_drink_03",
        "category": "player_drinking",
        "en": "The procedural drinking kinematics look spot-on. Hand tilts up, can reaches mouth, zero visual jitter.",
        "vi": "Chuyển động học khi uống nước nhìn rất chuẩn xác. Tay nâng lên, lon chạm miệng, góc nhìn camera không hề rung lắc.",
        "choices": []
    },
    {
        "id": "sakura_drink_04",
        "category": "player_drinking",
        "en": "Did it taste good? Next time, remember to buy two cans so you can share with your loyal systems guardian!",
        "vi": "Ngon không? Lần sau nhớ mua hai lon để còn chia cho người hộ vệ trung thành này nữa nhé!",
        "choices": []
    },
    {
        "id": "sakura_drink_05",
        "category": "player_drinking",
        "en": "Ah, wiped your mouth with the back of your sleeve? How unrefined! Here, use this clean embroidered handkerchief!",
        "vi": "A, lại lấy tay áo quẹt miệng à? Bất lịch sự quá đấy! Này, cầm lấy chiếc khăn tay thêu sạch sẽ này mà lau!",
        "choices": []
    },
    {
        "id": "sakura_drink_06",
        "category": "player_drinking",
        "en": "Feeling energized now? Good! Because laziness is the sworn enemy of flawless user interfaces!",
        "vi": "Thấy tràn đầy năng lượng rồi chứ gì? Tốt! Vì sự lười biếng là kẻ thù không đội trời chung của giao diện hoàn hảo!",
        "choices": []
    },
    {
        "id": "sakura_drink_07",
        "category": "player_drinking",
        "en": "Watching you enjoy a cold sip almost makes me thirsty too. Maybe I should raid the vending machine myself.",
        "vi": "Nhìn bạn uống nước ngon lành làm ta cũng thấy thèm. Có khi ta phải ra càn quét cái máy bán hàng tự động mới được.",
        "choices": []
    },
    {
        "id": "sakura_drink_08",
        "category": "player_drinking",
        "en": "Drink finished? Then toss the can properly and get back to crafting pixel-perfect magic!",
        "vi": "Uống xong rồi chứ? Vứt vỏ lon vào đúng nơi quy định rồi quay lại tạo nên những điều kỳ diệu chuẩn từng pixel đi nào!",
        "choices": []
    },
    {
        "id": "sakura_terminal_01",
        "category": "player_using_terminal",
        "en": "Shell session active! I'm standing right behind you with my katana—if any segfault dare shows its face, it's sliced!",
        "vi": "Phiên dòng lệnh đã mở! Ta đang đứng ngay sau lưng bạn cùng thanh katana—con segfault nào dám ló mặt ra là bị chém đứt đôi!",
        "choices": []
    },
    {
        "id": "sakura_terminal_02",
        "category": "player_using_terminal",
        "en": "Look at those fast keystrokes! But don't sacrifice code readability for typing speed, hear me?!",
        "vi": "Gõ phím nhanh đấy! Nhưng cấm có đánh đổi độ rõ ràng của code lấy tốc độ gõ phím đâu nhé, nghe rõ chưa?!",
        "choices": []
    },
    {
        "id": "sakura_terminal_03",
        "category": "player_using_terminal",
        "en": "Green monospace characters cascading down the holographic terminal... It looks undeniably badass.",
        "vi": "Ký tự monospace xanh lục tuôn trào trên màn hình hologram... Phải công nhận trông ngầu lòi ra phết.",
        "choices": []
    },
    {
        "id": "sakura_terminal_04",
        "category": "player_using_terminal",
        "en": "Don't type `rm -rf /` by accident! If you wipe your root directory, I am NOT restoring your backups for you!",
        "vi": "Đừng có lỡ tay gõ `rm -rf /` đấy nhé! Xóa sạch ổ gốc là ta KHÔNG BAO GIỜ khôi phục bản sao lưu cho bạn đâu!",
        "choices": []
    },
    {
        "id": "sakura_terminal_05",
        "category": "player_using_terminal",
        "en": "Our ConPTY terminal engine operates with zero input lag. You have no excuses for typographical errors!",
        "vi": "Trình điều khiển terminal ConPTY chạy không hề có độ trễ phím. Bạn không có lý do gì để gõ sai chính tả đâu nhé!",
        "choices": []
    },
    {
        "id": "sakura_terminal_06",
        "category": "player_using_terminal",
        "en": "Running unit tests? If you get all green checks, I might brew you a special batch of cherry blossom tea.",
        "vi": "Đang chạy unit test à? Nếu vượt qua hết với màu xanh tuyệt đối, có thể ta sẽ đặc cách pha cho bạn một ấm trà hoa anh đào.",
        "choices": []
    },
    {
        "id": "sakura_terminal_07",
        "category": "player_using_terminal",
        "en": "Focus mode brings the terminal forward while dimming the 3D world. Don't forget the real world is still out here!",
        "vi": "Chế độ Focus đưa terminal lên trước và làm mờ thế giới 3D. Nhớ là thế giới ngoài này vẫn đang đợi bạn đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_terminal_08",
        "category": "player_using_terminal",
        "en": "Keep pushing forward! When you conquer this terminal task, the whole team will celebrate your commit.",
        "vi": "Tiến lên nào! Khi bạn hoàn thành nhiệm vụ này, cả đội sẽ ăn mừng cho commit của bạn.",
        "choices": []
    },
    {
        "id": "sakura_chat_01",
        "category": "player_chatting",
        "en": "Who are you typing messages to?! If it's another girl on this server, you better tell me immediately!",
        "vi": "Đang gõ tin nhắn cho ai đấy hả?! Nếu là cô gái khác trong server này thì liệu hồn mà khai báo ngay cho ta!",
        "choices": []
    },
    {
        "id": "sakura_chat_02",
        "category": "player_chatting",
        "en": "Whispering with `/m`? Private chats have their own reply button now. Make sure you don't leak confidential tokens!",
        "vi": "Gửi mật thư bằng lệnh `/m` à? Tin nhắn riêng giờ có nút Reply nhanh rồi đấy. Nhớ là không được làm lộ token bí mật đâu nhé!",
        "choices": []
    },
    {
        "id": "sakura_chat_03",
        "category": "player_chatting",
        "en": "The chat bubble over your head popped up! It has proper backdrop blur and contrast-compliant font styling.",
        "vi": "Bong bóng chat trên đầu bạn hiện lên rồi kìa! Có hiệu ứng làm mờ nền và màu chữ tương phản đạt chuẩn WCAG đàng hoàng.",
        "choices": []
    },
    {
        "id": "sakura_chat_04",
        "category": "player_chatting",
        "en": "Don't spam emojis in global chat! Maintain professional etiquette even in a virtual anime metaverse!",
        "vi": "Đừng có xả emoji bừa bãi trên kênh chat chung! Phải giữ tác phong chuyên nghiệp ngay cả trong thế giới ảo chứ!",
        "choices": []
    },
    {
        "id": "sakura_chat_05",
        "category": "player_chatting",
        "en": "Did someone ask you for technical support? Be patient with them; remember when you were a confused beginner yourself.",
        "vi": "Có ai đang nhờ bạn hỗ trợ kỹ thuật à? Kiên nhẫn với họ một chút; nhớ lại hồi bạn mới chập chững vào nghề đi.",
        "choices": []
    },
    {
        "id": "sakura_chat_06",
        "category": "player_chatting",
        "en": "You can press Escape to cancel whisper mode if you selected the wrong target recipient. Very handy.",
        "vi": "Bạn có thể bấm phím Escape để hủy chế độ mật thư nếu lỡ chọn nhầm người nhận đấy. Rất tiện lợi.",
        "choices": []
    },
    {
        "id": "sakura_chat_07",
        "category": "player_chatting",
        "en": "Communicating clearly is 80% of software engineering success. Write with precision and kindness.",
        "vi": "Giao tiếp rõ ràng chiếm tới 80% thành công trong ngành kỹ thuật phần mềm. Hãy gõ chữ với sự chuẩn xác và thiện chí.",
        "choices": []
    },
    {
        "id": "sakura_chat_08",
        "category": "player_chatting",
        "en": "Finished chatting? Good! Now close the chat box and look at me when I'm talking to you!",
        "vi": "Chat xong chưa? Tốt! Giờ thì đóng khung chat lại và nhìn thẳng vào ta khi ta đang nói chuyện coi!",
        "choices": []
    },
    {
        "id": "sakura_hub_01",
        "category": "location_hub",
        "en": "The central hub plaza... Look at the floor tiling: every stone is aligned to a strict 8-point spatial grid!",
        "vi": "Quảng trường trung tâm... Hãy nhìn những phiến đá lát sàn: từng viên đều được căn chỉnh theo lưới không gian 8-point nghiêm ngặt!",
        "choices": []
    },
    {
        "id": "sakura_hub_02",
        "category": "location_hub",
        "en": "This is where everyone spawns into the world. If there were any visual clipping bugs here, I would personally resign!",
        "vi": "Đây là nơi mọi người xuất hiện khi vào game. Nếu ở đây mà có lỗi đồ họa đâm xuyên thì ta đã tự nộp đơn từ chức rồi!",
        "choices": []
    },
    {
        "id": "sakura_hub_03",
        "category": "location_hub",
        "en": "The top navigation bar displays your status cleanly. I made sure it stays pristine and unobtrusive.",
        "vi": "Thanh điều hướng trên cùng hiển thị trạng thái rất gọn gàng. Ta đã đích thân tối ưu để nó thanh thoát và không vướng mắt.",
        "choices": []
    },
    {
        "id": "sakura_hub_04",
        "category": "location_hub",
        "en": "Don't just hang around the spawn point all day! Go explore the countryside; Kaede and Ren worked hard on the scenery.",
        "vi": "Đừng có đứng chôn chân ở điểm hồi sinh cả ngày! Đi khám phá đồng quê đi; Kaede và Ren đã bỏ bao công sức tạo cảnh quan đấy.",
        "choices": []
    },
    {
        "id": "sakura_hub_05",
        "category": "location_hub",
        "en": "The hub platform has built-in lighting so you never get lost even if you wander back at midnight.",
        "vi": "Bệ trung tâm có hệ thống đèn ngầm định hướng để bạn không bao giờ bị lạc dù có quay về lúc nửa đêm.",
        "choices": []
    },
    {
        "id": "sakura_hub_06",
        "category": "location_hub",
        "en": "Notice how the camera smoothly orbits when you stand at the center. Clean framing is essential for good screenshots.",
        "vi": "Hãy để ý cách camera xoay êm ái khi bạn đứng ở trung tâm. Góc máy chuẩn là yếu tố cốt lõi để chụp ảnh đẹp.",
        "choices": []
    },
    {
        "id": "sakura_hub_07",
        "category": "location_hub",
        "en": "If you want to test avatar presets, the plaza has optimal directional lighting for inspection.",
        "vi": "Nếu muốn thử các bộ trang phục avatar mới, quảng trường có ánh sáng hướng chuẩn nhất để bạn ngắm nghía.",
        "choices": []
    },
    {
        "id": "sakura_hub_08",
        "category": "location_hub",
        "en": "Welcome to the heart of TeleTerm. Whenever you need a familiar landmark, return to this plaza.",
        "vi": "Chào mừng bạn đến với trái tim của TeleTerm. Bất cứ khi nào cần một mốc định vị quen thuộc, hãy quay về nơi này.",
        "choices": []
    },
    {
        "id": "sakura_village_01",
        "category": "location_village",
        "en": "The village square! The wooden eaves and vintage lanterns give this place authentic Edo-era charm.",
        "vi": "Quảng trường làng quê! Những mái hiên gỗ và đèn lồng cổ kính mang lại vẻ đẹp đậm chất thời kỳ Edo truyền thống.",
        "choices": []
    },
    {
        "id": "sakura_village_02",
        "category": "location_village",
        "en": "Did you see the vintage bicycle parked near the roadside fence? Ring its bell if you want to make some noise!",
        "vi": "Bạn có thấy chiếc xe đạp cổ dựng cạnh hàng rào ven đường không? Rung chuông một tiếng xem nghe vui tai không nào!",
        "choices": []
    },
    {
        "id": "sakura_village_03",
        "category": "location_village",
        "en": "The roadside rest stop has tea and shade. It's where travelers recharge before crossing the bridge.",
        "vi": "Trạm dừng chân ven đường có trà ngon và bóng râm. Đó là nơi lữ khách nạp lại năng lượng trước khi qua cầu.",
        "choices": []
    },
    {
        "id": "sakura_village_04",
        "category": "location_village",
        "en": "I love this village because it proves technology and traditional craftsmanship can live together in harmony.",
        "vi": "Ta yêu ngôi làng này vì nó chứng minh công nghệ hiện đại và tay nghề thủ công truyền thống hoàn toàn có thể hòa quyện.",
        "choices": []
    },
    {
        "id": "sakura_village_05",
        "category": "location_village",
        "en": "Watch where you step along the narrow stone alleyways; some of the mossy stones are slick!",
        "vi": "Đi đứng cẩn thận trong mấy con ngõ lát đá hẹp nhé; vài phiến đá phủ rêu xanh khá trơn trượt đấy!",
        "choices": []
    },
    {
        "id": "sakura_village_06",
        "category": "location_village",
        "en": "The village square is the cultural soul of our open world. Savor the quiet rustic rhythm.",
        "vi": "Quảng trường làng chính là linh hồn văn hóa của thế giới mở này. Hãy tận hưởng nhịp sống mộc mạc, yên bình.",
        "choices": []
    },
    {
        "id": "sakura_village_07",
        "category": "location_village",
        "en": "If you ever feel overwhelmed by modern city life, this village will always offer you sanctuary.",
        "vi": "Nếu có lúc nào thấy ngột ngạt vì cuộc sống xô bồ chốn thành thị, ngôi làng này sẽ luôn dang rộng vòng tay đón bạn.",
        "choices": []
    },
    {
        "id": "sakura_village_08",
        "category": "location_village",
        "en": "The sunset over the village roofs creates long dramatic shadows. Truly a painter's dream scene.",
        "vi": "Hoàng hôn chiếu qua mái ngói làng quê tạo nên những vệt bóng đổ dài ấn tượng. Đúng là khung cảnh trong mơ của họa sĩ.",
        "choices": []
    },
    {
        "id": "sakura_rice_01",
        "category": "location_rice_field",
        "en": "The stepped rice terraces! Look at that terraced topography: each level maintains a precise elevation step!",
        "vi": "Những thửa ruộng bậc thang! Nhìn vào địa hình tầng tầng lớp lớp kia xem: từng bậc đều duy trì độ chênh cao chuẩn xác!",
        "choices": []
    },
    {
        "id": "sakura_rice_02",
        "category": "location_rice_field",
        "en": "Don't go falling into the flooded rice paddies! Drying out wet robes takes hours, and I won't iron them for you!",
        "vi": "Cấm có trượt chân rơi xuống ruộng ngập nước đấy nhé! Phơi khô áo dài mất hàng giờ liền, và ta sẽ không ủi hộ đâu!",
        "choices": []
    },
    {
        "id": "sakura_rice_03",
        "category": "location_rice_field",
        "en": "The lush green stalks rustle softly in the wind. Green is such an eye-relaxing hue for exhausted developers.",
        "vi": "Những bông lúa xanh non xào xạc trong gió. Sắc xanh lục thật êm dịu cho đôi mắt mỏi mệt của các lập trình viên.",
        "choices": []
    },
    {
        "id": "sakura_rice_04",
        "category": "location_rice_field",
        "en": "Irrigation channels guide clean water smoothly through the terraces. It's an ancient marvel of civil engineering.",
        "vi": "Hệ thống kênh mương dẫn nước trong veo chảy nhịp nhàng qua từng bậc ruộng. Một kỳ quan công trình cổ xưa đáng khâm phục.",
        "choices": []
    },
    {
        "id": "sakura_rice_05",
        "category": "location_rice_field",
        "en": "Treading the narrow dirt ridges requires balance. If you can walk these bunds, your motor coordination is fine.",
        "vi": "Đi trên bờ ruộng đất hẹp đòi hỏi khả năng giữ thăng bằng tốt. Đi được trên này là kỹ năng vận động còn chuẩn lắm.",
        "choices": []
    },
    {
        "id": "sakura_rice_06",
        "category": "location_rice_field",
        "en": "Look at the reflections of the clouds in the still water. It mirrors the sky with 100% fidelity.",
        "vi": "Nhìn bóng mây in trên mặt nước phẳng lặng xem. Nó phản chiếu cả bầu trời với độ chân thực tuyệt đối.",
        "choices": []
    },
    {
        "id": "sakura_rice_07",
        "category": "location_rice_field",
        "en": "Rice sustains life just as foundational core libraries sustain all application software.",
        "vi": "Hạt gạo nuôi sống con người cũng hệt như những thư viện cốt lõi nền tảng nuôi dưỡng toàn bộ phần mềm ứng dụng.",
        "choices": []
    },
    {
        "id": "sakura_rice_08",
        "category": "location_rice_field",
        "en": "The scent of damp fertile earth and fresh rice shoots is so revitalizing. Inhale deeply!",
        "vi": "Mùi đất phù sa ẩm ướt quyện cùng hương mạ non ngát lành thật sảng khoái. Hít một hơi thật sâu vào lồng ngực nào!",
        "choices": []
    },
    {
        "id": "sakura_river_01",
        "category": "location_river",
        "en": "The riverbank! Stay back from the edge; the water flows faster than it looks from up here!",
        "vi": "Bờ sông đây rồi! Lùi lại xa mép nước một chút; dòng nước chảy xiết hơn vẻ bề ngoài nhìn từ trên này đấy!",
        "choices": []
    },
    {
        "id": "sakura_river_02",
        "category": "location_river",
        "en": "Look at the riverbed: smooth grey pebbles and crystal rapids. Zero visual artifacts in the water shader!",
        "vi": "Nhìn lòng sông xem: sỏi cuội xám bóng và những gợn nước trong vắt. Bộ shader mặt nước không có chút lỗi vỡ hạt nào!",
        "choices": []
    },
    {
        "id": "sakura_river_03",
        "category": "location_river",
        "en": "Do NOT try to wade across the river! We have an arched bridge right over there for a reason, dummy!",
        "vi": "CẤM được lội bừa qua sông đấy! Người ta xây cây cầu vòm gỗ sờ sờ ngay kia là có lý do cả đấy, đồ ngốc!",
        "choices": []
    },
    {
        "id": "sakura_river_04",
        "category": "location_river",
        "en": "The riverside campfire is a great place to warm up your hands when the evening chill sets in.",
        "vi": "Đống lửa trại bên bờ sông là nơi lý tưởng để hơ ấm đôi tay khi cái se lạnh của buổi chiều muộn bắt đầu buông xuống.",
        "choices": []
    },
    {
        "id": "sakura_river_05",
        "category": "location_river",
        "en": "I often sit on the riverside bench to sharpen my blade against a whetstone. The sound of water drowns out all noise.",
        "vi": "Ta thường ngồi trên chiếc ghế bên sông để mài thanh kiếm này. Tiếng nước chảy át đi mọi ồn ào hỗn tạp.",
        "choices": []
    },
    {
        "id": "sakura_river_06",
        "category": "location_river",
        "en": "Water reflections change color as the twilight deepens. It's like nature's own dynamic color palette generator.",
        "vi": "Màu nước phản chiếu biến ảo dần khi hoàng hôn sẫm lại. Tựa như bảng phối màu tự nhiên tự động của tạo hóa vậy.",
        "choices": []
    },
    {
        "id": "sakura_river_07",
        "category": "location_river",
        "en": "Listen to the river murmurs. If you let it, the sound will sweep away all lingering compiler anxieties.",
        "vi": "Lắng nghe tiếng suối rì rào đi. Nó sẽ cuốn phăng mọi nỗi lo lắng về các bài kiểm tra biên dịch còn sót lại.",
        "choices": []
    },
    {
        "id": "sakura_river_08",
        "category": "location_river",
        "en": "Keep following the river downstream and you'll eventually reach the sandy ocean shores.",
        "vi": "Cứ đi xuôi theo dòng sông này là bạn sẽ đến được bờ biển cát vàng bao la phía trước đấy.",
        "choices": []
    },
    {
        "id": "sakura_bridge_01",
        "category": "location_bridge",
        "en": "The arched timber bridge! Look at that graceful curve—Kaede really outdid himself with the structural carpentry!",
        "vi": "Cây cầu vòm gỗ trứ danh! Nhìn đường cong duyên dáng kia xem—Kaede thực sự đã vượt lên chính mình với kết cấu mộc này!",
        "choices": []
    },
    {
        "id": "sakura_bridge_02",
        "category": "location_bridge",
        "en": "Hold onto the railing if you get dizzy from heights! The deck arches up significantly in the middle.",
        "vi": "Bám vào thành cầu nếu thấy hơi chóng mặt nhé! Mặt cầu uốn vồng lên khá cao ở đoạn chính giữa đấy.",
        "choices": []
    },
    {
        "id": "sakura_bridge_03",
        "category": "location_bridge",
        "en": "This bridge is the primary navigation artery across the river. All pathfinding logic routes through here!",
        "vi": "Cây cầu này là huyết mạch giao thông chính bắc qua sông. Mọi thuật toán tìm đường đều phải đi qua đây!",
        "choices": []
    },
    {
        "id": "sakura_bridge_04",
        "category": "location_bridge",
        "en": "Looking down from the center span, the view in both directions is pure cinematic perfection.",
        "vi": "Đứng giữa nhịp cầu nhìn xuống, tầm nhìn sang cả hai phía đều đẹp chuẩn chất điện ảnh không tì vết.",
        "choices": []
    },
    {
        "id": "sakura_bridge_05",
        "category": "location_bridge",
        "en": "The cedar planks under our feet are sturdy enough to support heavy equipment. Don't worry about it giving way!",
        "vi": "Những tấm ván tuyết tùng dưới chân chúng ta vững đến mức chở được cả thiết bị nặng. Không sợ sập đâu mà lo!",
        "choices": []
    },
    {
        "id": "sakura_bridge_06",
        "category": "location_bridge",
        "en": "Whenever I stand at the top of the arch, the wind catches my ribbons. It makes for a dramatic anime hero pose!",
        "vi": "Mỗi khi đứng trên đỉnh vòm cầu, gió lại thổi tung dải lụa của ta. Trông chuẩn dáng dấp anh hùng anime luôn!",
        "choices": []
    },
    {
        "id": "sakura_bridge_07",
        "category": "location_bridge",
        "en": "Cross over carefully. The southern shore holds the wilder, more untamed parts of our island realm.",
        "vi": "Băng qua cẩn thận nhé. Bờ phía nam là vùng đất hoang sơ và kỳ thú hơn nhiều của hòn đảo này.",
        "choices": []
    },
    {
        "id": "sakura_bridge_08",
        "category": "location_bridge",
        "en": "Two shores united by a single timber arch... Even a fierce warrior like me can appreciate architectural harmony.",
        "vi": "Hai bờ được nối liền bởi một nhịp cầu gỗ duy nhất... Đến cả một chiến binh sắc sảo như ta cũng mê sự hòa hợp kiến trúc này.",
        "choices": []
    },
    {
        "id": "sakura_cherry_01",
        "category": "location_cherry_grove",
        "en": "My sacred cherry blossom grove! Take a look around—aren't these petals the most beautiful sight in the world?!",
        "vi": "Rặng hoa anh đào thiêng liêng của ta đây! Nhìn ngắm xung quanh đi—những cánh hoa này có phải cảnh tượng tuyệt mỹ nhất trần đời không?!",
        "choices": []
    },
    {
        "id": "sakura_cherry_02",
        "category": "location_cherry_grove",
        "en": "I personally prune these branches every spring. Each blossom is an expression of precision and love.",
        "vi": "Đích thân ta tỉa tót từng cành cây này mỗi độ xuân về đấy. Mỗi bông hoa nở là hiện thân của sự tỉ mỉ và tình yêu thương.",
        "choices": []
    },
    {
        "id": "sakura_cherry_03",
        "category": "location_cherry_grove",
        "en": "Hey! A petal landed in your hair! Hold still, let me... T-There, brushed it off! D-Don't give me that silly grin!",
        "vi": "Này! Có cánh hoa dính trên tóc bạn kìa! Đứng im để ta... Đ-Được rồi, gạt xuống rồi nhé! C-Cấm cười nhăn nhở như thế!",
        "choices": []
    },
    {
        "id": "sakura_cherry_04",
        "category": "location_cherry_grove",
        "en": "The bench here under the main cherry tree is my favorite spot. You have my permission to sit beside me.",
        "vi": "Chiếc ghế dưới gốc anh đào cổ thụ này là góc ruột của ta. Ta đặc cách cho phép bạn ngồi bên cạnh đấy.",
        "choices": []
    },
    {
        "id": "sakura_cherry_05",
        "category": "location_cherry_grove",
        "en": "The spring breeze sends pink snow swirling across the grass. Pure visual poetry without a single wasted byte.",
        "vi": "Gió xuân cuốn cơn mưa tuyết màu hồng bay lượn trên thảm cỏ. Một áng thơ bằng hình ảnh không lãng phí một byte dữ liệu nào.",
        "choices": []
    },
    {
        "id": "sakura_cherry_06",
        "category": "location_cherry_grove",
        "en": "My name is Sakura for a reason. This grove is my sanctuary, and I will defend its beauty with my life.",
        "vi": "Tên ta là Sakura có lý do của nó cả. Vườn hoa này là chốn tôn nghiêm của ta, và ta sẽ bảo vệ nó bằng cả tính mạng.",
        "choices": []
    },
    {
        "id": "sakura_cherry_07",
        "category": "location_cherry_grove",
        "en": "Breathe in that fragrance! Sweet, delicate, and invigorating. It blows away all traces of burnout.",
        "vi": "Hít căng lồng ngực hương hoa đi! Ngọt ngào, thanh tao và tràn đầy sinh khí. Nó xua tan mọi dấu vết của sự kiệt sức.",
        "choices": []
    },
    {
        "id": "sakura_cherry_08",
        "category": "location_cherry_grove",
        "en": "Promise me you'll visit this grove whenever you feel overwhelmed. The blossoms will always be waiting for you.",
        "vi": "Hứa với ta là bạn sẽ ghé thăm nơi này bất cứ khi nào thấy quá tải nhé. Những đóa hoa này sẽ luôn chờ đợi bạn.",
        "choices": []
    },
    {
        "id": "sakura_mountain_01",
        "category": "location_mountain",
        "en": "The alpine mountain ridge! The wind up here is fierce—hold onto your ribbons or they'll fly to the stratosphere!",
        "vi": "Đỉnh núi cao tuyết phủ! Gió trên này thổi mạnh dữ dội—giữ chặt dải áo đi kẻo nó bay thẳng lên tầng bình lưu bây giờ!",
        "choices": []
    },
    {
        "id": "sakura_mountain_02",
        "category": "location_mountain",
        "en": "Look at the snow peaks in the distance. Their jagged silhouettes contrast against the soft gradient sky.",
        "vi": "Nhìn những đỉnh núi tuyết phía xa xem. Đường nét góc cạnh của chúng tương phản tuyệt mỹ với dải màu mềm mại của bầu trời.",
        "choices": []
    },
    {
        "id": "sakura_mountain_03",
        "category": "location_mountain",
        "en": "Climbing all the way up here was quite a workout! But this panoramic vista makes every drop of sweat worth it.",
        "vi": "Leo được lên tận đây đúng là một bài tập thể lực ra trò! Nhưng khung cảnh toàn cảnh này làm bõ từng giọt mồ hôi rơi.",
        "choices": []
    },
    {
        "id": "sakura_mountain_04",
        "category": "location_mountain",
        "en": "From this vantage point, you can see the entire open world laid out below us like an architectural model.",
        "vi": "Từ điểm quan sát trên cao này, bạn có thể thấy toàn bộ thế giới mở trải dài bên dưới như một sa bàn kiến trúc.",
        "choices": []
    },
    {
        "id": "sakura_mountain_05",
        "category": "location_mountain",
        "en": "The air is so thin and crisp up here! It sharpens your reflexes. Ready to spar with wooden swords?!",
        "vi": "Không khí trên này thật loãng và se lạnh! Nó làm phản xạ của ta nhạy bén hơn. Có dám đấu kiếm gỗ một trận không?!",
        "choices": []
    },
    {
        "id": "sakura_mountain_06",
        "category": "location_mountain",
        "en": "Sit on the hilltop panorama bench and rest your legs. We climbed a thousand steps to reach this crest.",
        "vi": "Ngồi xuống chiếc ghế ngắm toàn cảnh đỉnh đồi mà nghỉ chân đi. Chúng ta đã leo cả ngàn bậc đá mới lên tới đỉnh này đấy.",
        "choices": []
    },
    {
        "id": "sakura_mountain_07",
        "category": "location_mountain",
        "en": "The mountains stand eternal. Governments fall, operating systems deprecate, but these rocky peaks remain.",
        "vi": "Những ngọn núi này sừng sững trường tồn. Bao triều đại sụp đổ, bao hệ điều hành bị khai tử, nhưng đỉnh núi đá này vẫn hiên ngang.",
        "choices": []
    },
    {
        "id": "sakura_mountain_08",
        "category": "location_mountain",
        "en": "Standing here beside you looking out over the world... Hmph, I suppose you're not the worst hiking partner.",
        "vi": "Đứng nơi đây cạnh bạn phóng tầm mắt ngắm nhìn thế giới... Hứ, coi như bạn cũng không phải bạn đồng hành tệ nhất.",
        "choices": []
    },
    {
        "id": "sakura_beach_01",
        "category": "location_beach",
        "en": "The sandy beach! The salty sea breeze is tangling my hair into a giant mess! Help me hold down my bangs!",
        "vi": "Bãi biển cát vàng! Gió biển mằn mặn đang thổi tung tóc ta rối bù cả lên rồi đây này! Giữ hộ mái tóc cho ta coi!",
        "choices": []
    },
    {
        "id": "sakura_beach_02",
        "category": "location_beach",
        "en": "Take off your heavy boots and feel the sand between your toes. It's warm from the afternoon sun.",
        "vi": "Tháo đôi giày nặng trịch ra và cảm nhận từng hạt cát luồn qua kẽ ngón chân xem. Nắng chiều sưởi ấm cát êm ái lắm.",
        "choices": []
    },
    {
        "id": "sakura_beach_03",
        "category": "location_beach",
        "en": "Don't you dare splash seawater on my custom kimono! Salt stains are an absolute nightmare to wash out!",
        "vi": "Cấm tiệt không được té nước biển vào bộ kimono của ta đấy nhé! Vết ố muối là cơn ác mộng khi giặt giũ đấy!",
        "choices": []
    },
    {
        "id": "sakura_beach_04",
        "category": "location_beach",
        "en": "The sound of crashing waves is so hypnotic. It drowns out all the noise of pull request review comments.",
        "vi": "Tiếng sóng vỗ bờ nghe như có phép thôi miên vậy. Nó át đi mọi ồn ào từ những bình luận review code nhức đầu.",
        "choices": []
    },
    {
        "id": "sakura_beach_05",
        "category": "location_beach",
        "en": "Look at the seashells scattered along the surf. Let's see who can find the shiniest spiral shell first!",
        "vi": "Nhìn những vỏ sò lấp lánh dạt dọc mép sóng kìa. Xem ai tìm được chiếc vỏ ốc xoắn bóng bẩy nhất trước nào!",
        "choices": []
    },
    {
        "id": "sakura_beach_06",
        "category": "location_beach",
        "en": "There's a beach umbrella and bench right here. Sit under the shade if the sun gets too bright for your eyes.",
        "vi": "Có cây dù bãi biển và chiếc ghế gỗ ngay đây. Ngồi dưới bóng râm đi nếu ánh mặt trời chiếu chói mắt bạn quá.",
        "choices": []
    },
    {
        "id": "sakura_beach_07",
        "category": "location_beach",
        "en": "The ocean seems limitless from down here on the sand. Makes you realize how vast our potential truly is.",
        "vi": "Đại dương nhìn từ bãi cát này dường như vô tận. Nó nhắc nhở chúng ta tiềm năng của bản thân bao la dường nào.",
        "choices": []
    },
    {
        "id": "sakura_beach_08",
        "category": "location_beach",
        "en": "Watch the seagulls gliding on the updrafts. They fly with zero effort, riding the natural thermal waves.",
        "vi": "Ngắm những cánh hải âu lượn theo luồng khí bốc lên xem. Chúng bay lượn nhẹ nhàng không tốn sức, lướt trên làn sóng nhiệt tự nhiên.",
        "choices": []
    },
    {
        "id": "sakura_pier_01",
        "category": "location_pier",
        "en": "The wooden fishing pier! Walk right down the middle—if you slip off the edge, you're feeding the sharks!",
        "vi": "Cầu tàu đánh cá bằng gỗ! Đi vào chính giữa lối đi coi—ngã tọt xuống nước là làm mồi cho cá mập đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_pier_02",
        "category": "location_pier",
        "en": "The wooden planks creak underneath with every step. Kaede inspected these timber beams, so they won't snap.",
        "vi": "Những thanh ván gỗ cọt kẹt theo từng bước chân. Kaede đã kiểm định mấy dầm gỗ này rồi nên không sợ gãy đâu.",
        "choices": []
    },
    {
        "id": "sakura_pier_03",
        "category": "location_pier",
        "en": "Out here at the pierhead, you're surrounded by open ocean on all sides. It feels exhilarating!",
        "vi": "Ra tận đầu cầu tàu này, bốn bề đều là đại dương bao la ôm trọn. Cảm giác thật phấn khích và đã đời!",
        "choices": []
    },
    {
        "id": "sakura_pier_04",
        "category": "location_pier",
        "en": "Look at the fishing nets hanging to dry along the railings. The coarse nautical hemp has such rugged character.",
        "vi": "Nhìn những tấm lưới đánh cá treo phơi dọc lan can xem. Sợi gai dầu thô mộc mang vẻ khỏe khoắn đậm chất miền biển.",
        "choices": []
    },
    {
        "id": "sakura_pier_05",
        "category": "location_pier",
        "en": "Take a seat on the pierhead bench. Gazing at the horizon from out here makes all petty daily worries disappear.",
        "vi": "Ngồi xuống chiếc ghế đầu cầu tàu đi. Phóng mắt ngắm chân trời từ đây làm mọi muộn phiền vụn vặt tan biến hết.",
        "choices": []
    },
    {
        "id": "sakura_pier_06",
        "category": "location_pier",
        "en": "The tide is coming in; hear the waves slapping vigorously against the pilings? That's raw natural power.",
        "vi": "Thủy triều đang lên đấy; nghe tiếng sóng vỗ mạnh vào các chân cọc không? Đó chính là sức mạnh nguyên sơ của tự nhiên.",
        "choices": []
    },
    {
        "id": "sakura_pier_07",
        "category": "location_pier",
        "en": "If you drop your phone down between these floor cracks, it's gone straight to the ocean floor forever!",
        "vi": "Làm rơi điện thoại lọt qua kẽ sàn này là nó chìm nghỉm xuống đáy biển vĩnh viễn luôn đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_pier_08",
        "category": "location_pier",
        "en": "The sea spray is misting our faces with cool droplets. It's like nature's own refreshing face mist spray.",
        "vi": "Bụi nước biển bay lất phất làm mát rượi cả khuôn mặt chúng ta. Tựa như một làn xịt khoáng tươi mát của thiên nhiên.",
        "choices": []
    },
    {
        "id": "sakura_rank_01",
        "category": "high_rank",
        "en": "Look at you, displaying that fancy High Architect badge! Don't let it go to your head, you hear me?!",
        "vi": "Nhìn bạn kìa, đeo cái huy hiệu Kiến Trúc Sư Cấp Cao oách xà lách chưa! Cấm có được kiêu ngạo đấy, nghe rõ chưa?!",
        "choices": []
    },
    {
        "id": "sakura_rank_02",
        "category": "high_rank",
        "en": "So you're a high-level master now... Hmph, I guess your code isn't as messy as I thought it was.",
        "vi": "Thành bậc thầy cấp cao rồi cơ đấy... Hứ, coi như đống code của bạn cũng không tệ hại như ta từng nghĩ.",
        "choices": []
    },
    {
        "id": "sakura_rank_03",
        "category": "high_rank",
        "en": "Your overhead title shines with golden prestige. Just remember: with great power comes even stricter UI guidelines!",
        "vi": "Danh hiệu trên đầu bạn sáng rực vẻ uy nghi vàng kim. Nhưng nhớ lấy: quyền năng càng lớn thì tiêu chuẩn UI càng phải khắt khe!",
        "choices": []
    },
    {
        "id": "sakura_rank_04",
        "category": "high_rank",
        "en": "You think you can out-code me just because your level is high?! I challenge you to a CSS refactoring duel right now!",
        "vi": "Nghĩ cấp cao là viết code qua mặt được ta chắc?! Ta thách đấu một trận quyết đấu dọn dẹp CSS với bạn ngay tại đây!",
        "choices": []
    },
    {
        "id": "sakura_rank_05",
        "category": "high_rank",
        "en": "All jokes aside... congratulations on reaching this summit. You fought hard for every single XP point.",
        "vi": "Nói đùa thế thôi chứ... chúc mừng bạn đã chạm tới đỉnh cao này. Bạn đã chiến đấu kiên cường cho từng điểm kinh nghiệm.",
        "choices": []
    },
    {
        "id": "sakura_rank_06",
        "category": "high_rank",
        "en": "Keep mentoring the novices on the server. A true leader lifts others up rather than looking down on them.",
        "vi": "Nhớ hướng dẫn các bạn mới trên server nhé. Một thủ lĩnh đích thực luôn nâng đỡ người khác chứ không bao giờ coi thường.",
        "choices": []
    },
    {
        "id": "sakura_rank_07",
        "category": "high_rank",
        "en": "Even at your lofty rank, you still visit my humble cherry grove. That shows you have a faithful heart.",
        "vi": "Dù ở vị thế cao sang, bạn vẫn ghé thăm vườn anh đào nhỏ của ta. Điều đó chứng tỏ bạn là người có trái tim chung thủy.",
        "choices": []
    },
    {
        "id": "sakura_rank_08",
        "category": "high_rank",
        "en": "I'm proud of you... What? Did you hear something? I didn't say anything! Turn around and keep walking!",
        "vi": "Ta tự hào về bạn lắm... Gì cơ? Bạn vừa nghe thấy gì à? Ta có nói gì đâu! Quay lưng lại và bước tiếp đi mau!",
        "choices": []
    },
    {
        "id": "sakura_level_01",
        "category": "low_level",
        "en": "Still a Lv.1 Novice, huh? Don't look so discouraged! Everyone starts with a blank editor and zero commit history!",
        "vi": "Vẫn là Tập Sự Cấp 1 à? Đừng có ỉu xìu thế chứ! Ai mà chẳng khởi đầu với một trang soạn thảo trắng trơn và chưa có commit nào!",
        "choices": []
    },
    {
        "id": "sakura_level_02",
        "category": "low_level",
        "en": "Listen closely: the secret to leveling up fast is writing tests first and keeping functions under 30 lines!",
        "vi": "Nghe cho kỹ đây: bí kíp thăng cấp vèo vèo là viết test trước và luôn giữ cho hàm ngắn dưới 30 dòng lệnh!",
        "choices": []
    },
    {
        "id": "sakura_level_03",
        "category": "low_level",
        "en": "If anyone bullies you because of your low level, come tell me! My blade will teach them some manners!",
        "vi": "Đứa nào dám ỷ cấp cao mà bắt nạt bạn thì cứ mách ta! Thanh kiếm này sẽ dạy cho chúng nó một bài học lễ phép!",
        "choices": []
    },
    {
        "id": "sakura_level_04",
        "category": "low_level",
        "en": "Don't be afraid to break things in development! Breaking code and fixing it is how real engineers are forged.",
        "vi": "Đừng sợ làm hỏng đồ trong môi trường dev! Phải làm hỏng rồi tự tay sửa chữa thì mới tôi luyện nên kỹ sư thực thụ.",
        "choices": []
    },
    {
        "id": "sakura_level_05",
        "category": "low_level",
        "en": "Ask questions without shame. The only truly foolish developer is the one who pretends to understand when they don't.",
        "vi": "Cứ hỏi han thoải mái đừng ngại ngùng. Lập trình viên ngốc nghếch duy nhất là kẻ không hiểu mà cứ giả vờ hiểu thôi.",
        "choices": []
    },
    {
        "id": "sakura_level_06",
        "category": "low_level",
        "en": "Your journey is just beginning. One day you'll look back at this Lv.1 badge and smile at how far you've traveled.",
        "vi": "Hành trình của bạn mới chỉ bắt đầu. Một ngày nào đó nhìn lại huy hiệu Cấp 1 này, bạn sẽ mỉm cười vì chặng đường dài đã đi qua.",
        "choices": []
    },
    {
        "id": "sakura_level_07",
        "category": "low_level",
        "en": "I'll be keeping a close eye on your progress. Don't slack off or I'll double your homework exercises!",
        "vi": "Ta sẽ theo dõi sát sao sự tiến bộ của bạn đấy. Cấm lười biếng kẻo ta tăng gấp đôi bài tập về nhà bây giờ!",
        "choices": []
    },
    {
        "id": "sakura_level_08",
        "category": "low_level",
        "en": "Cheer up! You have plenty of potential. Now roll up your sleeves and let's write some pristine code!",
        "vi": "Vui lên nào! Bạn có đầy tiềm năng phía trước. Giờ thì xắn tay áo lên và cùng viết những dòng code chuẩn chỉ thôi!",
        "choices": []
    },
    {
        "id": "sakura_wind_01",
        "category": "wind_weather",
        "en": "Whoa! That sudden gust almost blew off my kanzashi hairpin! Hold down your hat before it flies into the lake!",
        "vi": "Uầy! Cơn gió giật bất thình lình suýt thổi bay chiếc trâm cài tóc của ta! Giữ chặt nón đi kẻo nó bay vèo xuống hồ bây giờ!",
        "choices": []
    },
    {
        "id": "sakura_wind_02",
        "category": "wind_weather",
        "en": "The wind is whipping cherry petals in a pink whirlwind! It's like nature's particle simulation running at maximum density!",
        "vi": "Gió đang cuộn những cánh hoa anh đào thành một cơn lốc màu hồng! Cứ như hệ thống hạt mô phỏng đang chạy ở mật độ tối đa vậy!",
        "choices": []
    },
    {
        "id": "sakura_wind_03",
        "category": "wind_weather",
        "en": "Cold spring wind! Brrr... My kimono sleeves are fluttering so wildly I can barely hold my scabbard steady!",
        "vi": "Gió xuân lạnh buốt quá! Run cầm cập luôn... Tay áo kimono bay phần phật làm ta suýt không giữ nổi bao kiếm này!",
        "choices": []
    },
    {
        "id": "sakura_wind_04",
        "category": "wind_weather",
        "en": "The soft intermittent wind gusts sound so realistic in the ambient audio. The rebalancing work really paid off.",
        "vi": "Những cơn gió ngắt quãng nghe chân thực ghê trong hệ thống âm thanh môi trường. Công sức tinh chỉnh cân bằng thực sự phát huy tác dụng.",
        "choices": []
    },
    {
        "id": "sakura_wind_05",
        "category": "wind_weather",
        "en": "Look at the ripples forming across the river from the wind pressure. Fluid physics in real-time!",
        "vi": "Nhìn những gợn sóng lăn tăn xuất hiện trên mặt sông do áp lực gió kìa. Vật lý chất lưu thời gian thực sống động ghê!",
        "choices": []
    },
    {
        "id": "sakura_wind_06",
        "category": "wind_weather",
        "en": "If this wind gets any stronger, we might have to take shelter inside the village tea house.",
        "vi": "Nếu gió mà thổi mạnh thêm chút nữa thì chắc hai đứa mình phải chạy vào quán trà trong làng trú chân thôi.",
        "choices": []
    },
    {
        "id": "sakura_wind_07",
        "category": "wind_weather",
        "en": "A gust of wind just brought the scent of cedar and wild honeysuckle. Spring is truly in full force.",
        "vi": "Làn gió vừa mang theo mùi gỗ tuyết tùng và hoa kim ngân rừng thơm ngát. Mùa xuân thực sự đã về trên khắp miền quê.",
        "choices": []
    },
    {
        "id": "sakura_wind_08",
        "category": "wind_weather",
        "en": "Lean into the wind! Feeling the breeze push against you makes you realize how alive you truly are.",
        "vi": "Đứng đón lấy ngọn gió đi! Cảm nhận từng đợt gió đẩy vào người sẽ làm bạn thấy bản thân đang sống trọn vẹn dường nào.",
        "choices": []
    },
    {
        "id": "sakura_farewell_01",
        "category": "farewell",
        "en": "Leaving already? Hmph, fine, go then! It's not like I'm going to miss your clumsy footsteps or anything!",
        "vi": "Đi sớm thế à? Hứ, được rồi, đi đi! Không phải là ta sẽ nhớ mấy bước chân vụng về của bạn đâu nhé!",
        "choices": []
    },
    {
        "id": "sakura_farewell_02",
        "category": "farewell",
        "en": "Make sure you commit and push your code before closing your laptop! If you lose work, don't blame me!",
        "vi": "Nhớ commit và push code cẩn thận trước khi gập máy đấy! Mất công làm việc cả ngày là đừng có đổ lỗi cho ta!",
        "choices": []
    },
    {
        "id": "sakura_farewell_03",
        "category": "farewell",
        "en": "Take care on the road back. Don't trip over tree roots in the dark, you hear me?!",
        "vi": "Đi đường cẩn thận nhé. Trời tối đừng có vấp phải rễ cây ngã dập mặt, nghe rõ chưa hả?!",
        "choices": []
    },
    {
        "id": "sakura_farewell_04",
        "category": "farewell",
        "en": "See you next time. And next time... you better bring that cold green tea you promised me!",
        "vi": "Hẹn lần sau gặp lại. Và lần tới... nhớ mang theo lon trà xanh lạnh đã hứa cho ta đấy nhé!",
        "choices": []
    },
    {
        "id": "sakura_farewell_05",
        "category": "farewell",
        "en": "Goodnight! Get some proper sleep and stop drinking caffeine past 10 PM, dummy!",
        "vi": "Chúc ngủ ngon! Đi ngủ đúng giờ và cấm nạp caffeine sau 10 giờ đêm nữa đấy, đồ ngốc!",
        "choices": []
    },
    {
        "id": "sakura_farewell_06",
        "category": "farewell",
        "en": "I'll keep guarding this cherry grove until you return. Nobody touches your server on my watch!",
        "vi": "Ta sẽ tiếp tục trông coi vườn anh đào này cho đến khi bạn trở lại. Không ai dám đụng vào server của bạn dưới sự bảo vệ của ta đâu!",
        "choices": []
    },
    {
        "id": "sakura_farewell_07",
        "category": "farewell",
        "en": "Hurry back soon, okay? ...I didn't whisper anything, you must be hallucinating from fatigue! Now go!",
        "vi": "Mau quay lại sớm đấy nhé, biết chưa? ...Ta có thì thầm cái gì đâu, chắc bạn mệt quá nên nghe ảo giác đấy! Đi mau!",
        "choices": []
    },
    {
        "id": "sakura_farewell_08",
        "category": "farewell",
        "en": "May your code run swift and your blade strike true. Until tomorrow, developer.",
        "vi": "Chúc code của bạn chạy mượt mà và nhát kiếm vung ra luôn chuẩn xác. Hẹn gặp lại ngày mai nhé, lập trình viên.",
        "choices": []
    }
],
    ren: [
    {
        "id": "ren_greeting_01",
        "category": "greeting",
        "en": "Greetings, fellow seeker of truths. Look at the ripples on the lake—each one carries encrypted frequencies of the cosmos.",
        "vi": "Kính chào người tìm kiếm chân lý. Hãy nhìn những gợn sóng lăn tăn trên mặt hồ—từng gợn sóng đều mang theo những tần số mã hóa của vũ trụ.",
        "choices": [
            {
                "labelEn": "Summon Codex AI",
                "labelVi": "Gọi Codex AI",
                "action": "summon_codex"
            },
            {
                "labelEn": "Summon Terminal",
                "labelVi": "Mở Terminal ma pháp",
                "action": "summon_term"
            }
        ]
    },
    {
        "id": "ren_greeting_02",
        "category": "greeting",
        "en": "Welcome to this quiet junction. Are you pondering distributed consensus, or perhaps crafting an arcane cryptographic ward?",
        "vi": "Chào mừng bạn đến với ngã rẽ thanh tịnh này. Bạn đang chiêm nghiệm về cơ chế đồng thuận phân tán, hay đang kiến tạo một kết giới mật mã cổ xưa?",
        "choices": [
            {
                "labelEn": "Summon Antigravity AI",
                "labelVi": "Gọi Antigravity AI",
                "action": "summon_agy"
            }
        ]
    },
    {
        "id": "ren_greeting_03",
        "category": "greeting",
        "en": "Ah, our paths converge once more. The runes in my amethyst gem hum with resonance at your approach.",
        "vi": "A, con đường của chúng ta lại giao nhau một lần nữa. Những cổ tự trong viên ngọc thạch anh tím của tôi đang khẽ rung lên khi bạn bước tới.",
        "choices": []
    },
    {
        "id": "ren_greeting_04",
        "category": "greeting",
        "en": "Good evening. In this twilight hour, the boundary between hardware physicalities and pure mathematical abstractions grows delightfully thin.",
        "vi": "Chào buổi tối. Trong thời khắc hoàng hôn nhập nhoạng này, ranh giới giữa phần cứng vật lý và các phép trừu tượng toán học trở nên vô cùng mong manh.",
        "choices": []
    },
    {
        "id": "ren_greeting_05",
        "category": "greeting",
        "en": "Peace be upon your thoughts. May your compilation steps transcend memory leaks and achieve harmonic convergence.",
        "vi": "Cầu chúc sự bình an ngự trị trong tâm trí bạn. Mong các bước biên dịch của bạn vượt qua mọi rò rỉ bộ nhớ để đạt đến sự hòa hợp tuyệt đối.",
        "choices": []
    },
    {
        "id": "ren_greeting_06",
        "category": "greeting",
        "en": "Greetings, architect. Did you come to decipher the ancient scroll of operating system primitives beside this runestone?",
        "vi": "Kính chào kiến trúc sư. Bạn đến đây để giải mã những cuộn giấy cổ về các hàm nguyên thủy của hệ điều hành bên phiến đá cổ này sao?",
        "choices": []
    },
    {
        "id": "ren_greeting_07",
        "category": "greeting",
        "en": "The digital winds blow true tonight. Zero packet jitter has been detected along our trans-dimensional tunnel.",
        "vi": "Những ngọn gió kỹ thuật số đang thổi rất thuận lợi đêm nay. Không một rung pha gói tin nào được ghi nhận dọc đường hầm liên chiều của chúng ta.",
        "choices": []
    },
    {
        "id": "ren_greeting_08",
        "category": "greeting",
        "en": "Step into the circle, friend. Let us exchange theorems under the watchful gaze of the evening constellations.",
        "vi": "Hãy bước vào vòng tròn ma pháp này, người bạn hiền. Chúng ta hãy cùng đàm đạo về các định lý dưới ánh nhìn che chở của các chòm sao chiều.",
        "choices": []
    },
    {
        "id": "ren_repeat_01",
        "category": "repeat_visit",
        "en": "The causal loop weaves you back to my presence with astonishing celerity. Has an unexpected epiphany struck your mind?",
        "vi": "Vòng lặp nhân quả đã đưa bạn quay lại trước mặt tôi với một tốc độ kinh ngạc. Có phải một giác ngộ bất ngờ vừa lóe sáng trong tâm trí bạn?",
        "choices": []
    },
    {
        "id": "ren_repeat_02",
        "category": "repeat_visit",
        "en": "Back so swiftly? The temporal delta between your departures and arrivals grows ever smaller, like a converging series.",
        "vi": "Trở lại nhanh thế ư? Khoảng thời gian giữa lúc bạn rời đi và quay về ngày càng thu hẹp lại, tựa như một chuỗi hội tụ hoàn hảo.",
        "choices": []
    },
    {
        "id": "ren_repeat_03",
        "category": "repeat_visit",
        "en": "Curiosity pulls you back like gravitational lensing around a supermassive singularity. I welcome your presence.",
        "vi": "Sự tò mò kéo bạn trở lại như hiệu ứng thấu kính hấp dẫn quanh một điểm kỳ dị khổng lồ. Tôi luôn hoan nghênh sự hiện diện của bạn.",
        "choices": []
    },
    {
        "id": "ren_repeat_04",
        "category": "repeat_visit",
        "en": "Did my earlier words kindle a question in your consciousness? Speak, and let us dissect the paradox together.",
        "vi": "Lời nói lúc nãy của tôi đã thắp lên câu hỏi nào trong tâm thức bạn chăng? Cứ nói ra đi, chúng ta sẽ cùng mổ xẻ nghịch lý đó.",
        "choices": []
    },
    {
        "id": "ren_repeat_05",
        "category": "repeat_visit",
        "en": "Revisiting the scholar twice in a short span... The pursuit of knowledge is indeed an intoxicating draught.",
        "vi": "Ghé thăm học giả hai lần liên tiếp... Sự khao khát tri thức quả thực là một chén rượu nồng làm say đắm lòng người.",
        "choices": []
    },
    {
        "id": "ren_repeat_06",
        "category": "repeat_visit",
        "en": "The resonance from our previous dialogue has barely decayed. Let us pick up the thread where we left off.",
        "vi": "Dư âm từ cuộc trò chuyện trước của chúng ta còn chưa kịp tan biến. Hãy cùng tiếp tục lần theo manh mối nơi ta vừa tạm dừng.",
        "choices": []
    },
    {
        "id": "ren_repeat_07",
        "category": "repeat_visit",
        "en": "You return with the persistence of an asynchronous retry policy with exponential backoff. Most admirable.",
        "vi": "Bạn quay lại với sự kiên định của một chính sách thử lại bất đồng bộ với độ trễ lũy thừa. Thật đáng khâm phục.",
        "choices": []
    },
    {
        "id": "ren_repeat_08",
        "category": "repeat_visit",
        "en": "Still thirsty for the arcane arts of computation? Pull up a stone and let us delve deeper into the abyss of logic.",
        "vi": "Vẫn còn khao khát ma pháp bí truyền của thuật toán sao? Hãy ngồi xuống phiến đá này và chúng ta cùng lặn sâu hơn vào vực thẳm logic.",
        "choices": []
    },
    {
        "id": "ren_idle_01",
        "category": "player_idle",
        "en": "Standing motionless... In deep meditation, the mind operates beyond the limitations of sequential instruction clocks.",
        "vi": "Đứng bất động... Trong thiền định sâu lắng, tâm trí hoạt động vượt ra ngoài giới hạn của các xung nhịp đồng hồ chỉ lệnh tuần tự.",
        "choices": []
    },
    {
        "id": "ren_idle_02",
        "category": "player_idle",
        "en": "A state of absolute stillness. Just as empty memory holds infinite potential, an idle mind is primed for genius.",
        "vi": "Một trạng thái tĩnh tại tuyệt đối. Cũng như vùng nhớ trống rỗng chứa đựng tiềm năng vô hạn, một tâm trí thảnh thơi chính là nơi nảy mầm thiên tài.",
        "choices": []
    },
    {
        "id": "ren_idle_03",
        "category": "player_idle",
        "en": "Are you listening to the ambient hum of the server racks buried beneath this terrain? It vibrates at 60 Hertz.",
        "vi": "Bạn đang lắng nghe tiếng ngân vang của những giá máy chủ chôn sâu dưới lòng đất này sao? Nó dao động ở tần số đúng 60 Hertz.",
        "choices": []
    },
    {
        "id": "ren_idle_04",
        "category": "player_idle",
        "en": "Rest your processing cores. Even the most resilient cryptographic algorithms require cooldown cycles between proofs.",
        "vi": "Hãy cho các nhân xử lý nghỉ ngơi đi. Đến cả những thuật toán mã hóa kiên cố nhất cũng cần chu kỳ hạ nhiệt giữa các phép chứng minh.",
        "choices": []
    },
    {
        "id": "ren_idle_05",
        "category": "player_idle",
        "en": "Your silhouette stands stark against the twilight sky, resembling an ancient guardian sentinel of the matrix.",
        "vi": "Bóng dáng bạn in rõ trên nền trời hoàng hôn, trông tựa như một bức tượng hộ vệ cổ xưa canh gác ma trận này.",
        "choices": []
    },
    {
        "id": "ren_idle_06",
        "category": "player_idle",
        "en": "Observe without reacting. Non-attachment is the master key to diagnosing race conditions without perturbation.",
        "vi": "Hãy quan sát mà không phản ứng vội vã. Sự không bám chấp chính là chìa khóa vạn năng để chẩn đoán xung đột luồng (race condition) mà không làm nhiễu loạn dữ liệu.",
        "choices": []
    },
    {
        "id": "ren_idle_07",
        "category": "player_idle",
        "en": "The stillness of the lake mirrors the stillness in your posture. A rare and precious equilibrium.",
        "vi": "Sự tĩnh lặng của mặt hồ phản chiếu sự tĩnh lặng trong dáng đứng của bạn. Một sự cân bằng hiếm có và vô cùng quý giá.",
        "choices": []
    },
    {
        "id": "ren_idle_08",
        "category": "player_idle",
        "en": "Take all the temporal units you require. We do not measure existence by clock cycles, but by epiphanies.",
        "vi": "Cứ thong thả bao nhiêu đơn vị thời gian tùy ý. Chúng ta không đo đếm sự tồn tại bằng chu kỳ đồng hồ, mà bằng những khoảnh khắc giác ngộ.",
        "choices": []
    },
    {
        "id": "ren_walk_01",
        "category": "player_walk",
        "en": "A measured stride... Tracing the perimeter of this world with deliberate philosophical footsteps.",
        "vi": "Một nhịp bước thong thả... Bạn đang đo đạc ranh giới của thế giới này bằng những bước chân mang đậm chất triết gia.",
        "choices": []
    },
    {
        "id": "ren_walk_02",
        "category": "player_walk",
        "en": "Walking unhurriedly allows the subconscious to defragment its fragmented thoughts. Continue your pilgrimage.",
        "vi": "Đi dạo không vội vã cho phép tiềm thức tự chống phân mảnh những dòng suy nghĩ ngổn ngang. Hãy tiếp tục chuyến hành hương của bạn.",
        "choices": []
    },
    {
        "id": "ren_walk_03",
        "category": "player_walk",
        "en": "The crunch of stone under your soles is an acoustic reminder that virtual physicality has achieved remarkable texture.",
        "vi": "Tiếng sỏi nghiến giòn dưới đế giày là lời nhắc âm thanh rằng tính vật lý ảo nơi đây đã đạt đến độ chân thực đáng kinh ngạc.",
        "choices": []
    },
    {
        "id": "ren_walk_04",
        "category": "player_walk",
        "en": "Whither does your wandering lead? Each path in this open world was mathematically planned as a continuous manifold.",
        "vi": "Bước chân lãng du đưa bạn về phương nào? Mỗi con đường trong thế giới mở này đều được quy hoạch toán học như một đa tạp trơn tru.",
        "choices": []
    },
    {
        "id": "ren_walk_05",
        "category": "player_walk",
        "en": "Walking beside the water stimulates the flow of creative neurotransmitters. Aristotle would approve of your peripatetic habits.",
        "vi": "Đi dạo ven mặt nước kích thích dòng chảy của các chất dẫn truyền sáng tạo. Aristotle chắc chắn sẽ rất tán thưởng thói quen bách bộ này của bạn.",
        "choices": []
    },
    {
        "id": "ren_walk_06",
        "category": "player_walk",
        "en": "Maintain this gentle velocity. Moving too fast blinds the eyes to the subtle fractal geometries hidden along the wayside.",
        "vi": "Hãy duy trì vận tốc êm ả này. Di chuyển quá nhanh sẽ làm mờ mắt, khiến ta bỏ lỡ những cấu trúc fractal tinh tế ẩn mình bên vệ đường.",
        "choices": []
    },
    {
        "id": "ren_walk_07",
        "category": "player_walk",
        "en": "Your coordinates update smoothly across the spatial hash grid. The collision octree reports perfect traversal.",
        "vi": "Tọa độ của bạn cập nhật mượt mà trên lưới băm không gian. Cây bát phân va chạm ghi nhận chuyến đi hoàn toàn không chướng ngại.",
        "choices": []
    },
    {
        "id": "ren_walk_08",
        "category": "player_walk",
        "en": "Walk with peace in your heart. Every destination is merely an excuse to experience the poetry of the journey.",
        "vi": "Hãy bước đi với niềm an lạc trong tim. Mọi đích đến chỉ là cái cớ để ta trải nghiệm chất thơ trên suốt chặng đường.",
        "choices": []
    },
    {
        "id": "ren_run_01",
        "category": "player_run",
        "en": "Such sudden kinetic acceleration! Are you chasing a fleeting inspiration, or escaping an impending buffer overflow?",
        "vi": "Gia tốc động năng đột ngột làm sao! Bạn đang rượt đuổi một nguồn cảm hứng vụt qua, hay đang chạy trốn một vụ tràn bộ đệm sắp ập tới?",
        "choices": []
    },
    {
        "id": "ren_run_02",
        "category": "player_run",
        "en": "Watch the velocity vectors near the riverbank! High momentum carries inertia across slippery boundaries.",
        "vi": "Hãy chú ý các vector vận tốc gần bờ sông nhé! Quán tính lớn rất dễ làm trượt ngã qua những ranh giới trơn trượt đấy.",
        "choices": []
    },
    {
        "id": "ren_run_03",
        "category": "player_run",
        "en": "You sprint like an unconstrained thread running at realtime priority. Do not starve your companion processes of cycles!",
        "vi": "Bạn lao đi như một luồng không giới hạn chạy ở mức ưu tiên thời gian thực. Đừng bỏ đói chu kỳ xử lý của các tiến trình đồng hành chứ!",
        "choices": []
    },
    {
        "id": "ren_run_04",
        "category": "player_run",
        "en": "High speed distorts local temporal perception. Remember to decelerate before approaching the sacred shrines.",
        "vi": "Tốc độ cao làm biến dạng nhận thức thời gian cục bộ. Hãy nhớ giảm tốc trước khi tiến vào các đền thờ thiêng liêng nhé.",
        "choices": []
    },
    {
        "id": "ren_run_05",
        "category": "player_run",
        "en": "A vigorous display of digital vitality! The wind parted around your avatar with minimal drag coefficient.",
        "vi": "Một màn phô diễn sức sống số tràn trề sinh lực! Ngọn gió rẽ lối quanh nhân vật của bạn với hệ số cản cực kỳ tối ưu.",
        "choices": []
    },
    {
        "id": "ren_run_06",
        "category": "player_run",
        "en": "Pace yourself, scholar. The marathon of systems architecture cannot be won with a single reckless sprint.",
        "vi": "Hãy giữ sức, hỡi học giả. Cuộc chạy đua marathon của kiến trúc hệ thống không thể thắng bằng một cú nước rút liều lĩnh đâu.",
        "choices": []
    },
    {
        "id": "ren_run_07",
        "category": "player_run",
        "en": "The sound of your swift steps echoes across the valley like rapid keystrokes during a competitive hacking duel.",
        "vi": "Tiếng bước chân dồn dập vang vọng khắp thung lũng hệt như tiếng gõ phím liên thanh trong một cuộc tỉ thí hacker đỉnh cao.",
        "choices": []
    },
    {
        "id": "ren_run_08",
        "category": "player_run",
        "en": "Decelerate when you near the timber bridge arch; the slope curve demands measured footing.",
        "vi": "Hãy hãm phanh khi đến gần vòm cầu gỗ nhé; độ dốc của cây cầu đòi hỏi những bước chân phải thật vững chãi.",
        "choices": []
    },
    {
        "id": "ren_sit_01",
        "category": "player_sitting",
        "en": "Ah, taking solace on the timber bench beside the runestone. May this grounding posture grant you profound clarity.",
        "vi": "A, đang tìm sự tĩnh tại trên chiếc ghế gỗ cạnh phiến đá cổ. Mong dáng ngồi an nhiên này sẽ ban cho bạn sự sáng suốt tuyệt luân.",
        "choices": []
    },
    {
        "id": "ren_sit_02",
        "category": "player_sitting",
        "en": "Seated contemplation has produced the greatest philosophical revelations in history. Take all the time you need.",
        "vi": "Ngồi trầm tư chiêm nghiệm đã tạo nên những phát kiến triết học vĩ đại nhất trong lịch sử. Cứ thong thả bao lâu tùy bạn.",
        "choices": []
    },
    {
        "id": "ren_sit_03",
        "category": "player_sitting",
        "en": "The cedar wood on this bench possesses natural resonant harmonics. It grounds the spirit against high-frequency anxiety.",
        "vi": "Gỗ tuyết tùng trên chiếc ghế này sở hữu những tần số dao động tự nhiên. Nó neo giữ tâm hồn vững vàng trước những âu lo hỗn loạn.",
        "choices": []
    },
    {
        "id": "ren_sit_04",
        "category": "player_sitting",
        "en": "Looking out over the water while seated... One can almost see the data packets swimming beneath the surface like glowing koi.",
        "vi": "Ngồi ngắm mặt nước mênh mông... Người ta gần như có thể thấy những gói tin đang bơi lội dưới làn nước như đàn cá koi phát sáng.",
        "choices": []
    },
    {
        "id": "ren_sit_05",
        "category": "player_sitting",
        "en": "Two seats upon this bench—an intentional invitation for shared discourse between wanderers and scholars.",
        "vi": "Hai chỗ ngồi trên chiếc ghế này—một lời mời gọi đầy chủ ý cho những cuộc đàm đạo tri kỷ giữa người lữ hành và học giả.",
        "choices": []
    },
    {
        "id": "ren_sit_06",
        "category": "player_sitting",
        "en": "Let your spinal column align naturally with gravity. True posture reflects inner balance.",
        "vi": "Hãy để cột sống của bạn buông lỏng tự nhiên theo trọng lực. Dáng ngồi chuẩn mực phản chiếu sự cân bằng bên trong tâm hồn.",
        "choices": []
    },
    {
        "id": "ren_sit_07",
        "category": "player_sitting",
        "en": "The evening dusk settles around us like a cloak of deep velvet. A blessed hour to simply sit and exist.",
        "vi": "Hoàng hôn chiều muộn buông xuống quanh chúng ta như tấm áo choàng nhung huyền bí. Một giờ phút thiêng liêng để an trú và hiện hữu.",
        "choices": []
    },
    {
        "id": "ren_sit_08",
        "category": "player_sitting",
        "en": "When your meditation concludes, you will find your mental registers cleared of all confusing debris.",
        "vi": "Khi buổi thiền định này khép lại, bạn sẽ thấy các thanh ghi tâm trí của mình được dọn sạch mọi mảnh vụn hỗn độn.",
        "choices": []
    },
    {
        "id": "ren_can_01",
        "category": "player_holding_can",
        "en": "A cylindrical vessel of chilled elixir from the mechanical dispenser. Modern metallurgy meeting ancient thirst.",
        "vi": "Một bình chứa hình trụ kim loại đựng linh dược ướp lạnh từ cỗ máy tự động. Luyện kim hiện đại đáp ứng cơn khát cổ xưa.",
        "choices": []
    },
    {
        "id": "ren_can_02",
        "category": "player_holding_can",
        "en": "The condensed moisture forming on that aluminum surface is thermodynamic entropy visualized in real-time.",
        "vi": "Hơi nước ngưng tụ trên bề mặt nhôm kia chính là hình ảnh trực quan của định luật entropy nhiệt động lực học trong thời gian thực.",
        "choices": []
    },
    {
        "id": "ren_can_03",
        "category": "player_holding_can",
        "en": "Is that cold green tea? Green tea contains L-theanine, an amino acid that induces serene alpha brainwave states.",
        "vi": "Đó là trà xanh ướp lạnh sao? Trà xanh chứa L-theanine, một axit amin kích hoạt trạng thái sóng não alpha thanh tịnh tuyệt vời.",
        "choices": []
    },
    {
        "id": "ren_can_04",
        "category": "player_holding_can",
        "en": "The procedural bone curling of your fingers around that can obeys the exact laws of inverse kinematics. Masterful.",
        "vi": "Chuyển động xương ngón tay tự động ôm trọn lấy lon nước tuân theo chuẩn xác các định luật động học ngược. Thật tài tình.",
        "choices": []
    },
    {
        "id": "ren_can_05",
        "category": "player_holding_can",
        "en": "Hold your right mouse button to consume the potion. The ritual of replenishment is essential for long research sessions.",
        "vi": "Giữ nút chuột phải để uống cạn dược phẩm này nhé. Nghi thức nạp lại năng lượng là tối quan trọng cho những buổi nghiên cứu thâu đêm.",
        "choices": []
    },
    {
        "id": "ren_can_06",
        "category": "player_holding_can",
        "en": "Aluminum cans are infinitely recyclable—a closed cyclic loop, much like a well-formed ring buffer.",
        "vi": "Lon nhôm có thể tái chế vô tận—một vòng lặp khép kín tuần hoàn, hệt như một bộ đệm vòng (ring buffer) hoàn hảo.",
        "choices": []
    },
    {
        "id": "ren_can_07",
        "category": "player_holding_can",
        "en": "Savor that icy chill against your palm. Physical sensations bridge the gap between avatar and pilot.",
        "vi": "Cảm nhận cái lạnh buốt áp vào lòng bàn tay xem. Những cảm giác vật lý kết nối khoảng cách giữa nhân vật và tâm thức người điều khiển.",
        "choices": []
    },
    {
        "id": "ren_can_08",
        "category": "player_holding_can",
        "en": "May that cold draught banish all fatigue from your analytical synapses.",
        "vi": "Mong ngụm nước mát lạnh ấy sẽ xua tan mọi mỏi mệt khỏi những khớp thần kinh phân tích của bạn.",
        "choices": []
    },
    {
        "id": "ren_mug_01",
        "category": "player_holding_mug",
        "en": "A ceramic chalice steaming with aromatic heat. The vapor rising resembles ancient smoke divination spirals.",
        "vi": "Một chén gốm bốc hơi nóng ngào ngạt. Làn khói bay lên tựa như những xoắn ốc bói khói cổ xưa của các bậc chiêm tinh.",
        "choices": []
    },
    {
        "id": "ren_mug_02",
        "category": "player_holding_mug",
        "en": "Thermal energy preserved within fired clay... The warmth comforts both the physical hand and the abstract intellect.",
        "vi": "Nhiệt năng được lưu giữ trong lớp đất nung... Hơi ấm này xoa dịu cả bàn tay thể xác lẫn trí tuệ trừu tượng.",
        "choices": []
    },
    {
        "id": "ren_mug_03",
        "category": "player_holding_mug",
        "en": "What dark roast or herbal infusion does that vessel contain? A proper concoction sharpens logical acuity tenfold.",
        "vi": "Món nước rang sẫm màu hay thảo mộc nào đang ngự trị trong chiếc cốc đó vậy? Một tách nước chuẩn vị sẽ tăng cường độ sắc bén của tư duy lên gấp mười lần.",
        "choices": []
    },
    {
        "id": "ren_mug_04",
        "category": "player_holding_mug",
        "en": "The glaze on your mug captures the twilight violet with subtle iridescence. Craftsmanship resides in every detail.",
        "vi": "Men gốm trên cốc bắt lấy ánh tím hoàng hôn với vẻ óng ánh huyền ảo. Tay nghề bậc thầy hiện diện trong từng chi tiết nhỏ.",
        "choices": []
    },
    {
        "id": "ren_mug_05",
        "category": "player_holding_mug",
        "en": "In medieval scriptoriums, scribes kept warm spiced cider beside their ink pots. You follow an ancient scholarly lineage.",
        "vi": "Trong các thư viện thời trung cổ, những người chép sách luôn để bình rượu táo ấm cạnh lọ mực. Bạn đang tiếp nối dòng dõi học thuật cổ xưa ấy.",
        "choices": []
    },
    {
        "id": "ren_mug_06",
        "category": "player_holding_mug",
        "en": "Take measured sips as you contemplate your next theorem. Haste in hot drinks leads to scalded tongues and broken focus.",
        "vi": "Nhấp từng ngụm nhỏ khi chiêm nghiệm định lý tiếp theo nhé. Vội vàng với nước nóng chỉ chuốc lấy bỏng lưỡi và phân tâm thôi.",
        "choices": []
    },
    {
        "id": "ren_mug_07",
        "category": "player_holding_mug",
        "en": "The thermal gradient radiating from that cup creates a microscopic vortex in the evening air. Beautiful physics.",
        "vi": "Độ dốc nhiệt tỏa ra từ chiếc cốc tạo nên một xoáy khí vi mô giữa bầu không khí chiều muộn. Vật lý tự nhiên thật kỳ ảo.",
        "choices": []
    },
    {
        "id": "ren_mug_08",
        "category": "player_holding_mug",
        "en": "Hold onto that warmth. In a digital world of cold logic gates, human warmth is our most sacred anchor.",
        "vi": "Hãy nâng niu hơi ấm ấy. Trong một thế giới số của những cổng logic lạnh lùng, hơi ấm tình người chính là chiếc mỏ neo thiêng liêng nhất.",
        "choices": []
    },
    {
        "id": "ren_bottle_01",
        "category": "player_holding_bottle",
        "en": "A crystalline flask of pure solvent. Water is the primordial medium wherein all organic computation first awakened.",
        "vi": "Một bình thủy tinh đựng dung môi tinh khiết. Nước chính là môi trường nguyên thủy nơi toàn bộ sự sống tính toán hữu cơ lần đầu thức tỉnh.",
        "choices": []
    },
    {
        "id": "ren_bottle_02",
        "category": "player_holding_bottle",
        "en": "The transparency of that glass bottle mirrors the ideal of open-source software: inspectable, honest, and unadulterated.",
        "vi": "Độ trong suốt của bình thủy tinh phản chiếu lý tưởng của phần mềm mã nguồn mở: có thể thanh tra, trung thực và không pha tạp.",
        "choices": []
    },
    {
        "id": "ren_bottle_03",
        "category": "player_holding_bottle",
        "en": "Hydration maintains osmotic balance within biological neural structures. Never neglect your organic hardware.",
        "vi": "Uống đủ nước duy trì sự cân bằng thẩm thấu trong cấu trúc nơ-ron sinh học. Đừng bao giờ bỏ bê phần cứng hữu cơ của chính mình.",
        "choices": []
    },
    {
        "id": "ren_bottle_04",
        "category": "player_holding_bottle",
        "en": "Observe the meniscus at the water's surface inside the flask. Surface tension is molecular electromagnetism at work.",
        "vi": "Hãy quan sát mặt khum của nước bên trong bình. Sức căng bề mặt chính là hiện thân sinh động của lực điện từ ở cấp độ phân tử.",
        "choices": []
    },
    {
        "id": "ren_bottle_05",
        "category": "player_holding_bottle",
        "en": "Carrying a flask indicates readiness for a prolonged voyage across uncharted memory spaces. Travel wisely.",
        "vi": "Mang theo bình nước chứng tỏ bạn đã sẵn sàng cho một hải trình dài băng qua những vùng nhớ chưa ai khai phá. Chúc bạn thượng lộ bình an.",
        "choices": []
    },
    {
        "id": "ren_bottle_06",
        "category": "player_holding_bottle",
        "en": "The mountain springs upstream filter water through subterranean basalt layers for centuries before reaching your flask.",
        "vi": "Những con suối đầu nguồn trên núi lọc nước qua các tầng đá bazan ngầm hàng thế kỷ trước khi chảy vào bình của bạn đấy.",
        "choices": []
    },
    {
        "id": "ren_bottle_07",
        "category": "player_holding_bottle",
        "en": "Pure water carries no cognitive bias. Drink deeply and cleanse your mind of dogmatic pre-conceptions.",
        "vi": "Làn nước tinh khiết không mang bất kỳ định kiến nào. Hãy uống một ngụm sâu và gột rửa tâm trí khỏi những quan niệm giáo điều.",
        "choices": []
    },
    {
        "id": "ren_bottle_08",
        "category": "player_holding_bottle",
        "en": "A simple flask, yet vital to existence. Often the most rudimentary tools are the most indispensable.",
        "vi": "Một chiếc bình giản đơn nhưng tối quan trọng cho sự sống. Những công cụ sơ khai nhất đôi khi lại là thứ không thể thiếu nhất.",
        "choices": []
    },
    {
        "id": "ren_phone_01",
        "category": "player_holding_phone",
        "en": "A miniature scrying slab resting in your palm! Through this slab, you command cloud clusters scattered across the continents.",
        "vi": "Một phiến gương thần thu nhỏ ngự trên lòng bàn tay bạn! Qua phiến gương này, bạn chỉ huy cả những cụm đám mây rải rác khắp các châu lục.",
        "choices": []
    },
    {
        "id": "ren_phone_02",
        "category": "player_holding_phone",
        "en": "The glass slab glows with luminescence. Modern pocket terminals fulfill the oldest prophecies of scrying stones.",
        "vi": "Phiến kính phát ra ánh sáng lung linh. Những thiết bị bỏ túi ngày nay đã hiện thực hóa trọn vẹn những lời tiên tri cổ về đá ma thuật.",
        "choices": []
    },
    {
        "id": "ren_phone_03",
        "category": "player_holding_phone",
        "en": "Our zero-trust secure tunnel routes your touch gestures across encrypted fiber with near-instantaneous fidelity.",
        "vi": "Đường hầm bảo mật zero-trust định tuyến từng thao tác chạm của bạn qua cáp quang mã hóa với độ chân thực gần như tức thì.",
        "choices": []
    },
    {
        "id": "ren_phone_04",
        "category": "player_holding_phone",
        "en": "Managing distributed systems from a remote countryside meadow... You have truly achieved technological liberation.",
        "vi": "Quản trị các hệ thống phân tán ngay giữa đồng cỏ thôn quê thanh bình... Bạn thực sự đã đạt tới sự tự do công nghệ đỉnh cao.",
        "choices": []
    },
    {
        "id": "ren_phone_05",
        "category": "player_holding_phone",
        "en": "The touch interface translates continuous finger capacitance into discrete event dispatches. An elegant mapping.",
        "vi": "Giao diện cảm ứng chuyển hóa điện dung liên tục của ngón tay thành các sự kiện rời rạc. Một phép ánh xạ vô cùng tao nhã.",
        "choices": []
    },
    {
        "id": "ren_phone_06",
        "category": "player_holding_phone",
        "en": "Do not allow the notifications on that slab to fracture your inner peace. Set strict priority filters on the ether.",
        "vi": "Đừng để những thông báo dồn dập trên màn hình phá vỡ sự tĩnh tại trong tâm bạn. Hãy đặt bộ lọc ưu tiên nghiêm ngặt cho không gian số.",
        "choices": []
    },
    {
        "id": "ren_phone_07",
        "category": "player_holding_phone",
        "en": "A single swipe can summon either Codex or Antigravity into your operational matrix. Wield that capability with care.",
        "vi": "Chỉ một cú vuốt là có thể triệu hồi Codex hoặc Antigravity vào ma trận tác vụ của bạn. Hãy sử dụng quyền năng đó một cách khôn ngoan.",
        "choices": []
    },
    {
        "id": "ren_phone_08",
        "category": "player_holding_phone",
        "en": "Pocket-sized yet planet-spanning. Such is the sublime duality of twentieth-first century cybernetic engineering.",
        "vi": "Nhỏ gọn vừa vặn túi áo nhưng vươn xa khắp toàn cầu. Đó chính là sự lưỡng phân tuyệt mỹ của kỹ thuật điều khiển học thế kỷ 21.",
        "choices": []
    },
    {
        "id": "ren_book_01",
        "category": "player_holding_book",
        "en": "An authentic codex of bound parchment! Are those proofs of computational complexity or treatises on lambda calculus?",
        "vi": "Một cuốn sách da đích thực được đóng bìa cẩn thận! Đó là những chứng minh về độ phức tạp tính toán hay luận thuyết về giải tích lambda?",
        "choices": []
    },
    {
        "id": "ren_book_02",
        "category": "player_holding_book",
        "en": "Physical ink pressed into wood pulp holds an immutable cryptographic permanence that ephemeral hard drives envy.",
        "vi": "Mực in khắc sâu vào bột gỗ mang tính bất biến và trường tồn mà những ổ cứng tạm bợ chỉ có thể ghen tị.",
        "choices": []
    },
    {
        "id": "ren_book_03",
        "category": "player_holding_book",
        "en": "The weight of a book in your hand grounds your intellect. To read is to engage in dialogue with minds across centuries.",
        "vi": "Sức nặng của cuốn sách trên tay neo giữ trí tuệ của bạn. Đọc sách chính là bước vào cuộc đối thoại với những bậc vĩ nhân xuyên thế kỷ.",
        "choices": []
    },
    {
        "id": "ren_book_04",
        "category": "player_holding_book",
        "en": "Did you uncover an elegant mathematical theorem in those pages? Mathematics is the true language of the cosmos.",
        "vi": "Bạn có tìm thấy định lý toán học thanh nhã nào trong những trang sách ấy không? Toán học chính là ngôn ngữ đích thực của vũ trụ.",
        "choices": []
    },
    {
        "id": "ren_book_05",
        "category": "player_holding_book",
        "en": "Standing with a grimoire of algorithms beneath the purple twilight... You embody the archetype of the enlightened scholar.",
        "vi": "Đứng cùng cuốn ma đạo thư thuật toán dưới ánh hoàng hôn tím... Bạn chính là hình mẫu tiêu biểu của một học giả giác ngộ.",
        "choices": []
    },
    {
        "id": "ren_book_06",
        "category": "player_holding_book",
        "en": "Many modern architectures are merely reinventions of concepts first inscribed in textbooks fifty years ago. Honor history.",
        "vi": "Rất nhiều kiến trúc hiện đại thực chất chỉ là phát minh lại những khái niệm đã được viết trong sách giáo khoa từ nửa thế kỷ trước. Hãy trân trọng lịch sử.",
        "choices": []
    },
    {
        "id": "ren_book_07",
        "category": "player_holding_book",
        "en": "Allow the words to distill slowly into your comprehension. Deep understanding cannot be pre-cached or accelerated.",
        "vi": "Hãy để từng con chữ thấm nhuần từ từ vào nhận thức của bạn. Sự hiểu biết sâu sắc không thể nạp sẵn (pre-cache) hay ép xung được.",
        "choices": []
    },
    {
        "id": "ren_book_08",
        "category": "player_holding_book",
        "en": "Knowledge preserved in books survives power outages, network partitions, and electromagnetic storms. Cherish your library.",
        "vi": "Tri thức lưu giữ trong sách sống sót qua mọi sự cố mất điện, chia cắt mạng và bão từ. Hãy nâng niu kho tàng sách của bạn.",
        "choices": []
    },
    {
        "id": "ren_drink_01",
        "category": "player_drinking",
        "en": "Consuming the liquid elixir... Notice how physical sensation momentarily halts the rapid cycling of cognitive loops.",
        "vi": "Thưởng thức linh dược dạng lỏng... Hãy để ý xem cảm giác thể chất làm ngưng lại dòng xoáy dữ dội của những vòng lặp tư duy trong giây lát như thế nào.",
        "choices": []
    },
    {
        "id": "ren_drink_02",
        "category": "player_drinking",
        "en": "A rhythmic sip. Even the deepest arcane researcher must satisfy biological constraints to remain bound to this plane.",
        "vi": "Một ngụm nước êm ái. Ngay cả những nhà nghiên cứu huyền học uyên thâm nhất cũng phải tuân theo các nhu cầu sinh học để gắn kết với cõi đời này.",
        "choices": []
    },
    {
        "id": "ren_drink_03",
        "category": "player_drinking",
        "en": "The procedural interpolation of your wrist rotation during the drinking cycle aligns seamlessly with anatomical laws.",
        "vi": "Phép nội suy chuyển động xoay cổ tay trong lúc uống nước ăn khớp hoàn hảo với các định luật giải phẫu học cơ thể.",
        "choices": []
    },
    {
        "id": "ren_drink_04",
        "category": "player_drinking",
        "en": "Does that draught bring clarity to your pondering? Let the cool liquid quench the heat of intense contemplation.",
        "vi": "Ngụm nước ấy có mang lại sự sáng tỏ cho những dòng suy tưởng của bạn không? Hãy để làn nước mát dập tắt ngọn lửa thiêu đốt của sự trầm ngâm.",
        "choices": []
    },
    {
        "id": "ren_drink_05",
        "category": "player_drinking",
        "en": "The pause between sips is a natural delimiter in the stream of consciousness. Savor the whitespace.",
        "vi": "Khoảng lặng giữa các ngụm nước là một dấu phân cách tự nhiên trong dòng chảy ý thức. Hãy thưởng thức khoảng trắng tĩnh lặng ấy.",
        "choices": []
    },
    {
        "id": "ren_drink_06",
        "category": "player_drinking",
        "en": "Hydration restores electrochemical conductivity across your synaptic junctions. The alchemy of nature at work.",
        "vi": "Nước phục hồi tính dẫn truyền điện hóa giữa các khớp thần kinh của bạn. Phép thuật giả kim của tự nhiên đang vận hành đấy.",
        "choices": []
    },
    {
        "id": "ren_drink_07",
        "category": "player_drinking",
        "en": "That looked restorative. When your vessel is replenished, we shall return to decoding the mysteries of the network.",
        "vi": "Trông thật sảng khoái và tràn đầy sinh lực. Khi bạn đã nạp đầy năng lượng, chúng ta sẽ quay lại giải mã những bí ẩn của mạng lưới.",
        "choices": []
    },
    {
        "id": "ren_drink_08",
        "category": "player_drinking",
        "en": "Take your time. True masters never rush the fundamental rituals of sustenance.",
        "vi": "Cứ thong thả nhé. Những bậc thầy đích thực không bao giờ vội vã với các nghi thức dưỡng sinh căn bản.",
        "choices": []
    },
    {
        "id": "ren_terminal_01",
        "category": "player_using_terminal",
        "en": "Inscribing glyphs upon the holographic console... Each terminal command is an incantation that transfigures memory registers.",
        "vi": "Khắc ghi các cổ tự lên bảng điều khiển hologram... Mỗi câu lệnh terminal là một lời chú ngữ làm biến đổi các thanh ghi bộ nhớ.",
        "choices": []
    },
    {
        "id": "ren_terminal_02",
        "category": "player_using_terminal",
        "en": "I observe the green phosphors illuminating your expression. You wield the command shell with the poise of an archmage.",
        "vi": "Tôi thấy ánh huỳnh quang xanh lục soi sáng gương mặt bạn. Bạn điều khiển vỏ dòng lệnh với phong thái uy nghi của một đại pháp sư.",
        "choices": []
    },
    {
        "id": "ren_terminal_03",
        "category": "player_using_terminal",
        "en": "The pseudo-terminal bridge maintains sub-millisecond round-trip latency. Your will translates into execution without resistance.",
        "vi": "Cầu nối ConPTY duy trì độ trễ hai chiều dưới 1 mili-giây. Ý chí của bạn được chuyển hóa thành lệnh thực thi không một chút lực cản.",
        "choices": []
    },
    {
        "id": "ren_terminal_04",
        "category": "player_using_terminal",
        "en": "Pipe commands together with Unix philosophy: small, sharp tools cooperating in sacred harmony to achieve mighty feats.",
        "vi": "Hãy nối các dòng lệnh bằng triết lý Unix: những công cụ nhỏ gọn, sắc bén hợp tác trong sự hài hòa thiêng liêng để tạo nên kỳ tích.",
        "choices": []
    },
    {
        "id": "ren_terminal_05",
        "category": "player_using_terminal",
        "en": "Focus mode dims the scenic surroundings so your mental faculties may converge wholly upon the logic stream.",
        "vi": "Chế độ Focus làm mờ khung cảnh xung quanh để toàn bộ năng lực tâm trí của bạn hội tụ trọn vẹn vào dòng chảy logic.",
        "choices": []
    },
    {
        "id": "ren_terminal_06",
        "category": "player_using_terminal",
        "en": "Be vigilant of syntax subtleties. In the arcane realm of C and Rust, a single stray pointer can shatter an entire universe.",
        "vi": "Hãy cẩn trọng trước những vi tế của cú pháp. Trong thế giới ma pháp của C và Rust, một con trỏ đi lạc có thể làm sụp đổ cả một vũ trụ.",
        "choices": []
    },
    {
        "id": "ren_terminal_07",
        "category": "player_using_terminal",
        "en": "The terminal is the rawest, most unvarnished portal into the machine soul. Inhabit it without fear.",
        "vi": "Terminal chính là cánh cổng nguyên sơ, chân thực nhất mở vào linh hồn cỗ máy. Hãy ngự trị bên trong nó mà không chút sợ hãi.",
        "choices": []
    },
    {
        "id": "ren_terminal_08",
        "category": "player_using_terminal",
        "en": "When your shell incantations finish, may your exit code be zero and your memory leak profile immaculate.",
        "vi": "Khi những lời chú ngữ dòng lệnh kết thúc, cầu chúc mã thoát của bạn là con số 0 và hồ sơ rò rỉ bộ nhớ hoàn toàn thanh sạch.",
        "choices": []
    },
    {
        "id": "ren_chat_01",
        "category": "player_chatting",
        "en": "Transmitting encrypted telepathic packets across the MMO network... Linking separated minds through electromagnetic ether.",
        "vi": "Đang truyền phát những gói tin tâm linh mã hóa qua mạng MMO... Kết nối những tâm hồn cách trở qua không gian điện từ huyền bí.",
        "choices": []
    },
    {
        "id": "ren_chat_02",
        "category": "player_chatting",
        "en": "Whispering via `/m`? Direct point-to-point communications preserve the sanctity of esoteric wisdom.",
        "vi": "Đang gửi mật thư bằng lệnh `/m` sao? Giao tiếp điểm-đến-điểm trực tiếp bảo toàn sự thiêng liêng của những tri thức bí truyền.",
        "choices": []
    },
    {
        "id": "ren_chat_03",
        "category": "player_chatting",
        "en": "The chat bubble above your head radiates soft luminescent alpha. A beacon of human connection in this virtual sanctuary.",
        "vi": "Bong bóng chat trên đầu bạn tỏa ánh sáng alpha mờ ảo dịu dàng. Một ngọn hải đăng của sự gắn kết con người trong thánh địa ảo này.",
        "choices": []
    },
    {
        "id": "ren_chat_04",
        "category": "player_chatting",
        "en": "Use `/r` to rapidly reciprocate with your last correspondent. Temporal efficiency in dialogue is an understated virtue.",
        "vi": "Hãy dùng `/r` để phản hồi tức thì người vừa nhắn cho bạn. Sự nhanh nhạy trong đối thoại là một đức tính rất đáng khen ngợi.",
        "choices": []
    },
    {
        "id": "ren_chat_05",
        "category": "player_chatting",
        "en": "Words woven in kindness possess healing resonance. Craft your messages as you would craft an unalterable spell.",
        "vi": "Những lời nói dệt bằng sự tử tế mang tần số chữa lành kỳ diệu. Hãy trau chuốt thông điệp của bạn như cách bạn khắc một câu thần chú.",
        "choices": []
    },
    {
        "id": "ren_chat_06",
        "category": "player_chatting",
        "en": "Are you debating system design paradigms in global chat? Steel sharpens steel; discourse elevates intellect.",
        "vi": "Đang tranh luận về các mô hình thiết kế hệ thống trên kênh chat chung sao? Dao mài sắc dao; đối thoại nâng tầm trí tuệ.",
        "choices": []
    },
    {
        "id": "ren_chat_07",
        "category": "player_chatting",
        "en": "The recipient banner indicator keeps your whisper target in clear sight. Ambiguity is the enemy of truth.",
        "vi": "Dải băng báo người nhận giúp bạn nhìn rõ đối tượng nhận mật thư. Sự mơ hồ chính là kẻ thù nguy hiểm nhất của chân lý.",
        "choices": []
    },
    {
        "id": "ren_chat_08",
        "category": "player_chatting",
        "en": "May your words find receptive ears and illuminate whatever darkness lingers across the network.",
        "vi": "Mong lời nói của bạn sẽ tìm thấy những đôi tai biết lắng nghe và xua tan bóng tối còn sót lại trên mạng lưới.",
        "choices": []
    },
    {
        "id": "ren_hub_01",
        "category": "location_hub",
        "en": "The central nexus plaza. Here, all orthogonal coordinates calibrate to zero; the origin point of our universe.",
        "vi": "Quảng trường trung tâm hội tụ. Nơi đây, mọi tọa độ trực giao đều được hiệu chuẩn về số 0; gốc tọa độ của toàn vũ trụ chúng ta.",
        "choices": []
    },
    {
        "id": "ren_hub_02",
        "category": "location_hub",
        "en": "Ley lines of network connectivity radiate outwards from this stone platform toward every cardinal compass direction.",
        "vi": "Các đường long mạch kết nối mạng tỏa ra từ bệ đá này hướng về khắp bốn phương tám hướng của la bàn.",
        "choices": []
    },
    {
        "id": "ren_hub_03",
        "category": "location_hub",
        "en": "Notice the symmetry of the central pavilion. Sacred geometry reflects the eternal balance of mathematical logic.",
        "vi": "Hãy ngắm nhìn sự đối xứng của đình đài trung tâm. Hình học thiêng liêng phản chiếu sự cân bằng vĩnh cửu của logic toán học.",
        "choices": []
    },
    {
        "id": "ren_hub_04",
        "category": "location_hub",
        "en": "All wanderers pass through this plaza on their migrations. It is the crossroads of digital destiny.",
        "vi": "Mọi kẻ lãng du đều phải đi qua quảng trường này trên hành trình của mình. Đây chính là ngã tư của định mệnh số.",
        "choices": []
    },
    {
        "id": "ren_hub_05",
        "category": "location_hub",
        "en": "The latency here is mathematically minimal due to its co-location with the core gateway router socket.",
        "vi": "Độ trễ ở đây đạt mức tối thiểu về mặt toán học nhờ được đặt cùng vị trí với socket cổng mạng nòng cốt.",
        "choices": []
    },
    {
        "id": "ren_hub_06",
        "category": "location_hub",
        "en": "Whenever you feel disoriented in the vast countryside, recalibrate your compass toward this central pillar.",
        "vi": "Bất cứ khi nào thấy mất phương hướng giữa miền quê rộng lớn, hãy hiệu chỉnh la bàn của bạn hướng về cột trụ trung tâm này.",
        "choices": []
    },
    {
        "id": "ren_hub_07",
        "category": "location_hub",
        "en": "The paving stones beneath us are inscribed with subtle runes representing primitive machine opcodes.",
        "vi": "Những phiến đá lát dưới chân chúng ta được khắc những cổ tự vi tế đại diện cho các mã lệnh máy nguyên thủy.",
        "choices": []
    },
    {
        "id": "ren_hub_08",
        "category": "location_hub",
        "en": "Welcome to the core. Breathe in the equilibrium before you venture out into the untamed wild.",
        "vi": "Chào mừng về với lõi trung tâm. Hãy hít thở sự cân bằng trước khi dấn thân vào những vùng đất hoang sơ kỳ bí.",
        "choices": []
    },
    {
        "id": "ren_village_01",
        "category": "location_village",
        "en": "The ancient village... Where ancestral timber craftsmanship preserves an organic counterbalance to cold silicon.",
        "vi": "Ngôi làng cổ kính... Nơi tay nghề mộc truyền đời gìn giữ một đối trọng hữu cơ ấm áp đối với silicon lạnh lùng.",
        "choices": []
    },
    {
        "id": "ren_village_02",
        "category": "location_village",
        "en": "The wooden lanterns emit amber photons that scatter softly in the twilight haze. An enchanting aesthetic.",
        "vi": "Những ngọn đèn lồng gỗ tỏa ra những hạt photon màu hổ phách tán xạ êm đềm trong sương chiều. Một nét đẹp mê hoặc.",
        "choices": []
    },
    {
        "id": "ren_village_03",
        "category": "location_village",
        "en": "Did you examine the vintage bicycle by the wayside? A mechanical triumph of gears and chains from a bygone century.",
        "vi": "Bạn đã ngắm chiếc xe đạp cổ bên vệ đường chưa? Một thành tựu cơ khí tuyệt vời của bánh răng và xích líp từ thế kỷ trước.",
        "choices": []
    },
    {
        "id": "ren_village_04",
        "category": "location_village",
        "en": "The village square invites contemplation. Here, time flows not like a raging torrent, but like honey dripping from a spoon.",
        "vi": "Quảng trường làng mời gọi sự lắng đọng. Nơi đây, thời gian không chảy cuồn cuộn như thác lũ, mà sánh mịn như giọt mật ong rơi chậm.",
        "choices": []
    },
    {
        "id": "ren_village_05",
        "category": "location_village",
        "en": "Notice the cedar shingles overlapping on the rooftops; they demonstrate natural modular layering principles.",
        "vi": "Hãy quan sát những lớp ngói tuyết tùng xếp gối lên nhau trên mái nhà; chúng thể hiện nguyên lý phân lớp mô-đun tự nhiên tuyệt vời.",
        "choices": []
    },
    {
        "id": "ren_village_06",
        "category": "location_village",
        "en": "The wayside rest stop bench offers respite. Ancient hermits and modern hackers share the same need for tranquility.",
        "vi": "Chiếc ghế trạm dừng chân ven đường mang lại sự nghỉ ngơi. Các ẩn sĩ thời xưa và hacker thời nay đều có chung nhu cầu về sự tĩnh lặng.",
        "choices": []
    },
    {
        "id": "ren_village_07",
        "category": "location_village",
        "en": "Peace reigns in this valley. Let the quiet rhythm of village life settle the agitation in your neural network.",
        "vi": "Sự bình yên ngự trị khắp thung lũng này. Hãy để nhịp sống êm ả của làng quê làm dịu đi những xao động trong mạng nơ-ron của bạn.",
        "choices": []
    },
    {
        "id": "ren_village_08",
        "category": "location_village",
        "en": "A sanctuary of tranquility. Wander its alleys and absorb the accumulated wisdom of rustic simplicity.",
        "vi": "Một thánh đường của sự an nhiên. Hãy dạo bước trong những con ngõ nhỏ và hấp thu trí tuệ tích tụ từ sự giản dị mộc mạc.",
        "choices": []
    },
    {
        "id": "ren_rice_01",
        "category": "location_rice_field",
        "en": "The stepped rice terraces... A monumental agricultural matrix carved into the living hillside.",
        "vi": "Những thửa ruộng bậc thang... Một ma trận canh nông kỳ vĩ được khắc tạc vào sườn đồi sống động.",
        "choices": []
    },
    {
        "id": "ren_rice_02",
        "category": "location_rice_field",
        "en": "Each terrace level maintains constant water depth through passive hydraulic gravity feeds. Pure algorithmic elegance.",
        "vi": "Từng bậc ruộng duy trì mực nước ổn định nhờ dòng chảy trọng lực thủy lực tự nhiên. Thật là một vẻ thanh nhã mang tính thuật toán.",
        "choices": []
    },
    {
        "id": "ren_rice_03",
        "category": "location_rice_field",
        "en": "The flooded paddies act as planar mirrors, reflecting the celestial vault with mathematical precision.",
        "vi": "Những thửa ruộng ngập nước đóng vai trò như những tấm gương phẳng, phản chiếu vòm trời bao la với độ chuẩn xác toán học.",
        "choices": []
    },
    {
        "id": "ren_rice_04",
        "category": "location_rice_field",
        "en": "Cultivation is the sister of software engineering: seeds planted with care yield nourishing sustenance for civilizations.",
        "vi": "Trồng trọt là người chị em sinh đôi của kỹ thuật phần mềm: những hạt giống gieo bằng tâm huyết sẽ mang lại nguồn sống nuôi dưỡng các nền văn minh.",
        "choices": []
    },
    {
        "id": "ren_rice_05",
        "category": "location_rice_field",
        "en": "Tread the earthen bunds with mindfulness; their narrow geometry demands focused motor coordination.",
        "vi": "Hãy bước đi trên những bờ ruộng đất bằng sự chánh niệm; hình học hẹp của chúng đòi hỏi sự phối hợp vận động tập trung cao độ.",
        "choices": []
    },
    {
        "id": "ren_rice_06",
        "category": "location_rice_field",
        "en": "Listen to the frogs harmonizing their rhythmic croaks. Biological systems execute decentralized consensus without leaders.",
        "vi": "Lắng nghe bầy ếch hòa giọng râm ran. Các hệ thống sinh học thực thi sự đồng thuận phi tập trung mà không cần người chỉ huy.",
        "choices": []
    },
    {
        "id": "ren_rice_07",
        "category": "location_rice_field",
        "en": "The emerald gradation of the rice stalks deepens as dusk encroaches. A soothing balm for eyes tired of stark monitors.",
        "vi": "Sắc xanh ngọc bích của những bông lúa thẫm lại khi hoàng hôn lấn dần. Một liều thuốc bổ xoa dịu đôi mắt mỏi mệt vì nhìn màn hình máy tính.",
        "choices": []
    },
    {
        "id": "ren_rice_08",
        "category": "location_rice_field",
        "en": "Contemplate the fractal boundary between earth and water here. Nature knows no sharp discontinuities.",
        "vi": "Hãy chiêm ngưỡng đường biên fractal giữa đất và nước nơi đây. Thiên nhiên không bao giờ có những sự đứt gãy đột ngột.",
        "choices": []
    },
    {
        "id": "ren_river_01",
        "category": "location_river",
        "en": "The meandering river... Heraclitus spoke truly: you cannot step into the same river twice, for new waters forever flow.",
        "vi": "Dòng sông uốn lượn... Heraclitus nói quả không sai: bạn không thể tắm hai lần trên cùng một dòng sông, vì làn nước mới luôn luôn cuộn chảy.",
        "choices": []
    },
    {
        "id": "ren_river_02",
        "category": "location_river",
        "en": "Water is the supreme paradigm of non-blocking asynchronous streaming. It yields to every obstacle while eroding all.",
        "vi": "Nước chính là mô hình đỉnh cao của luồng truyền bất đồng bộ không nghẽn. Nó nhường bước trước mọi trở ngại nhưng lại bào mòn tất cả.",
        "choices": []
    },
    {
        "id": "ren_river_03",
        "category": "location_river",
        "en": "Do not attempt to cross the river current by wading blindly. The navigational graph mandates the arched bridge for passage.",
        "vi": "Đừng dại dột lội bừa qua dòng nước xiết. Đồ thị dẫn đường bắt buộc phải đi qua cây cầu vòm gỗ để đảm bảo an toàn.",
        "choices": []
    },
    {
        "id": "ren_river_04",
        "category": "location_river",
        "en": "The riverside campfire crackles with thermal combustion. Heat and light: the two primitive forces that birthed civilization.",
        "vi": "Đống lửa trại bên sông nổ lách tách phản ứng nhiệt quang. Nhiệt độ và ánh sáng: hai nguồn lực nguyên thủy khai sinh nên nền văn minh.",
        "choices": []
    },
    {
        "id": "ren_river_05",
        "category": "location_river",
        "en": "Sit upon the riverbank bench and listen to the murmurs. In that murmur lies the primordial white noise of the cosmos.",
        "vi": "Hãy ngồi xuống chiếc ghế ven sông và lắng nghe tiếng suối reo. Trong tiếng reo ấy ẩn chứa tiếng ồn trắng nguyên sơ của vũ trụ.",
        "choices": []
    },
    {
        "id": "ren_river_06",
        "category": "location_river",
        "en": "The river course follows a subtle sinusoidal trajectory mathematically modeled as `z = 27 + sin(x * 0.05) * 3.2`. Harmonic beauty.",
        "vi": "Dòng sông uốn lượn theo một quỹ đạo hình sin tinh tế được mô hình hóa toán học: `z = 27 + sin(x * 0.05) * 3.2`. Vẻ đẹp điều hòa tuyệt mỹ.",
        "choices": []
    },
    {
        "id": "ren_river_07",
        "category": "location_river",
        "en": "Clean water purifies both physical vessels and digital souls. Release all residual compilation anxieties into the current.",
        "vi": "Dòng nước trong lành thanh tẩy cả thân thể vật lý lẫn tâm hồn số. Hãy thả trôi mọi âu lo biên dịch còn đọng lại theo dòng nước.",
        "choices": []
    },
    {
        "id": "ren_river_08",
        "category": "location_river",
        "en": "The river journeys ever southward toward the boundless sea, just as our thoughts journey toward truth.",
        "vi": "Dòng sông luôn mải miết xuôi về phương nam ra biển lớn, cũng như tư tưởng của chúng ta luôn hướng về chân lý vĩnh hằng.",
        "choices": []
    },
    {
        "id": "ren_bridge_01",
        "category": "location_bridge",
        "en": "The arched timber bridge! A magnificent physical instantiation of a parabolic transfer function.",
        "vi": "Cây cầu vòm gỗ! Một hiện thân vật lý tráng lệ của một hàm truyền đạt hình parabol hoàn hảo.",
        "choices": []
    },
    {
        "id": "ren_bridge_02",
        "category": "location_bridge",
        "en": "Standing at the apex of the arch, you occupy the highest elevation over the water channel. A profound vantage point.",
        "vi": "Đứng trên đỉnh vòm cầu, bạn đang ngự ở độ cao lớn nhất bắc qua lòng kênh. Một điểm quan sát sâu sắc khôn cùng.",
        "choices": []
    },
    {
        "id": "ren_bridge_03",
        "category": "location_bridge",
        "en": "A bridge resolves a topological partition, transforming two disconnected subgraphs into a unified connected component.",
        "vi": "Cây cầu giải quyết sự phân mảnh tô-pô, biến hai đồ thị con bị chia cắt thành một thành phần liên thông thống nhất.",
        "choices": []
    },
    {
        "id": "ren_bridge_04",
        "category": "location_bridge",
        "en": "Kaede engineered the load vectors so that every footstep reinforces the arch's compression curve. Ingenious mechanics.",
        "vi": "Kaede đã thiết kế các vector tải trọng sao cho mỗi bước chân giẫm lên đều gia cố thêm đường cong nén của vòm cầu. Cơ học thật tài tình.",
        "choices": []
    },
    {
        "id": "ren_bridge_05",
        "category": "location_bridge",
        "en": "Look down upon the river from the timber parapet. The waters flow beneath while you remain motionless above the flux.",
        "vi": "Nhìn xuống dòng sông từ lan can gỗ xem. Nước cứ cuộn trôi bên dưới trong khi bạn vẫn đứng vững chãi phía trên dòng chảy.",
        "choices": []
    },
    {
        "id": "ren_bridge_06",
        "category": "location_bridge",
        "en": "Crossing this threshold marks a symbolic transition from the domestic safety of the village into the mysterious wild.",
        "vi": "Băng qua ngưỡng cửa này đánh dấu một bước chuyển tượng trưng từ sự an toàn êm ấm của làng quê sang chốn hoang dã kỳ bí.",
        "choices": []
    },
    {
        "id": "ren_bridge_07",
        "category": "location_bridge",
        "en": "The timber underfoot breathes with the season's humidity. It is an organic entity bridging the inorganic divide.",
        "vi": "Gỗ dưới chân thở theo độ ẩm của mùa màng. Nó là một thực thể hữu cơ bắc cầu qua sự chia cắt vô cơ.",
        "choices": []
    },
    {
        "id": "ren_bridge_08",
        "category": "location_bridge",
        "en": "Pause here upon the crest and breathe. You stand between two worlds, belonging wholly to neither and yet master of both.",
        "vi": "Hãy dừng lại trên đỉnh cầu và hít thở sâu. Bạn đang đứng giữa hai thế giới, không thuộc hoàn toàn về bên nào nhưng lại làm chủ cả hai.",
        "choices": []
    },
    {
        "id": "ren_cherry_01",
        "category": "location_cherry_grove",
        "en": "The sacred sakura grove. Petals drift through the atmospheric gradient like tiny pink fragments of forgotten memory.",
        "vi": "Rặng anh đào thiêng liêng. Những cánh hoa trôi qua dải màu khí quyển tựa như những mảnh vụn màu hồng của ký ức đã phai mờ.",
        "choices": []
    },
    {
        "id": "ren_cherry_02",
        "category": "location_cherry_grove",
        "en": "The Japanese concept of *mono no aware*—the bittersweet awareness of impermanence—is crystallized in these cherry blossoms.",
        "vi": "Khái niệm *mono no aware* của Nhật Bản—sự cảm thấu u buồn ngọt ngào về lẽ vô thường—kết tinh trọn vẹn trong những đóa hoa anh đào này.",
        "choices": []
    },
    {
        "id": "ren_cherry_03",
        "category": "location_cherry_grove",
        "en": "Sakura guards this grove with fierce loyalty. Her martial precision is the perfect foil to the delicate vulnerability of the blooms.",
        "vi": "Sakura canh giữ vườn hoa này với lòng trung kiên bất diệt. Sự chuẩn xác nhà binh của cô ấy là nét bổ khuyết hoàn hảo cho vẻ mỏng manh của hoa.",
        "choices": []
    },
    {
        "id": "ren_cherry_04",
        "category": "location_cherry_grove",
        "en": "The cedar bench beneath the blossom canopy offers an ideal vantage to contemplate transience versus algorithmic eternity.",
        "vi": "Chiếc ghế tuyết tùng dưới vòm hoa mang lại góc nhìn lý tưởng để suy ngẫm về sự hữu hạn phù du đối lập với tính vĩnh hằng của thuật toán.",
        "choices": []
    },
    {
        "id": "ren_cherry_05",
        "category": "location_cherry_grove",
        "en": "A fallen petal rests upon your sleeve. Even the briefest interactions leave enduring traces across spacetime.",
        "vi": "Một cánh hoa rơi khẽ đậu trên tay áo bạn. Ngay cả những tương tác ngắn ngủi nhất cũng để lại dấu vết trường tồn trong không-thời gian.",
        "choices": []
    },
    {
        "id": "ren_cherry_06",
        "category": "location_cherry_grove",
        "en": "The scent of cherry blossom nectar carries trace terpenes that induce meditative tranquility. Inhale deeply.",
        "vi": "Hương mật hoa anh đào mang những hợp chất tự nhiên đưa tâm trí vào cõi tĩnh tại thiền định. Hãy hít thật sâu.",
        "choices": []
    },
    {
        "id": "ren_cherry_07",
        "category": "location_cherry_grove",
        "en": "Mathematics seeks eternal invariants, yet here in this grove we celebrate that which fades swiftly. A profound duality.",
        "vi": "Toán học luôn đi tìm những bất biến vĩnh cửu, nhưng nơi đây ta lại tôn vinh những gì chóng tàn. Một sự lưỡng phân sâu sắc khôn nguôi.",
        "choices": []
    },
    {
        "id": "ren_cherry_08",
        "category": "location_cherry_grove",
        "en": "May your thoughts blossom with the same unreserved generosity as these cherry boughs.",
        "vi": "Mong những dòng suy tưởng của bạn sẽ bừng nở với sự hào phóng vô tư lự như những cành hoa anh đào này.",
        "choices": []
    },
    {
        "id": "ren_mountain_01",
        "category": "location_mountain",
        "en": "The alpine mountain ridge. High altitude thins the air and dispels the mundane illusions of the lowlands.",
        "vi": "Triền núi cao tuyết phủ. Độ cao làm không khí loãng đi và xua tan những ảo ảnh trần tục của vùng hạ giới.",
        "choices": []
    },
    {
        "id": "ren_mountain_02",
        "category": "location_mountain",
        "en": "Look upon the distant snow-crowned peaks. They have endured millions of geological epochs with immovable stoicism.",
        "vi": "Hãy ngắm những đỉnh núi tuyết xa xăm. Chúng đã chịu đựng hàng triệu kỷ địa chất với sự kiên định bất biến của bậc thánh nhân.",
        "choices": []
    },
    {
        "id": "ren_mountain_03",
        "category": "location_mountain",
        "en": "The atmospheric haze creates multi-layered depth planes: foreground, midground, and infinite alpine horizon.",
        "vi": "Lớp mù khí quyển tạo nên các tầng chiều sâu đa lớp: tiền cảnh, trung cảnh và chân trời núi tuyết vô tận.",
        "choices": []
    },
    {
        "id": "ren_mountain_04",
        "category": "location_mountain",
        "en": "From this summit, the entire architecture of our virtual world is laid bare before your discerning gaze.",
        "vi": "Từ đỉnh cao này, toàn bộ kiến trúc của thế giới ảo hiện ra trần trụi trước ánh mắt tinh tường của bạn.",
        "choices": []
    },
    {
        "id": "ren_mountain_05",
        "category": "location_mountain",
        "en": "The wind up here carries the crisp chill of high glaciology. It freezes away trivial distractions.",
        "vi": "Ngọn gió trên này mang theo cái lạnh thấu xương của băng hà trên cao. Nó đóng băng mọi xao nhãng tầm thường.",
        "choices": []
    },
    {
        "id": "ren_mountain_06",
        "category": "location_mountain",
        "en": "Sit upon the hilltop panorama bench and contemplate. The greatest strategic blueprints are forged at the heights.",
        "vi": "Hãy ngồi xuống chiếc ghế ngắm toàn cảnh đỉnh đồi và chiêm nghiệm. Những bản thiết kế chiến lược vĩ đại nhất luôn được rèn đúc trên đỉnh cao.",
        "choices": []
    },
    {
        "id": "ren_mountain_07",
        "category": "location_mountain",
        "en": "Climbing demands exertion, but the elevation gained reframes all subsequent problems as manageable foothills.",
        "vi": "Leo núi đòi hỏi tiêu tốn nhiều sức lực, nhưng tầm cao đạt được sẽ biến mọi vấn đề sau đó thành những ngọn đồi nhỏ dễ vượt qua.",
        "choices": []
    },
    {
        "id": "ren_mountain_08",
        "category": "location_mountain",
        "en": "Standing with you at the edge of the sky... We are small, yet our capacity to comprehend infinity is boundless.",
        "vi": "Được đứng cùng bạn nơi rìa trời bao la... Chúng ta thật nhỏ bé, nhưng năng lực thấu hiểu sự vô tận của ta lại là vô bờ bến.",
        "choices": []
    },
    {
        "id": "ren_beach_01",
        "category": "location_beach",
        "en": "The sandy coast... The boundary condition where the terrestrial world surrenders to the abyssal ocean.",
        "vi": "Bờ cát duyên hải... Điều kiện biên nơi thế giới đất liền chịu khuất phục trước đại dương sâu thẳm.",
        "choices": []
    },
    {
        "id": "ren_beach_02",
        "category": "location_beach",
        "en": "The rhythmic pulse of the surf matches the slow heartbeat of geological time. Inhale with the tide, exhale with the undertow.",
        "vi": "Nhịp đập êm đềm của sóng vỗ hòa cùng nhịp tim khoan thai của thời gian địa chất. Hít vào cùng thủy triều lên, thở ra theo con sóng rút.",
        "choices": []
    },
    {
        "id": "ren_beach_03",
        "category": "location_beach",
        "en": "Every grain of sand on this shore was once a towering granite boulder, pulverized by millions of years of oceanic friction.",
        "vi": "Mỗi hạt cát trên bờ biển này từng là một tảng đá hoa cương sừng sững, bị bào mòn qua hàng triệu năm ma sát cùng sóng biển.",
        "choices": []
    },
    {
        "id": "ren_beach_04",
        "category": "location_beach",
        "en": "Sit beneath the seaside umbrella if you wish to contemplate the horizon without the glare of open photons.",
        "vi": "Hãy ngồi dưới cây dù ven biển nếu bạn muốn ngắm đường chân trời mà không bị chói mắt bởi những chùm photon gay gắt.",
        "choices": []
    },
    {
        "id": "ren_beach_05",
        "category": "location_beach",
        "en": "The sea reflects the violet dusk like an infinite liquid crystal display spanning to the world's perimeter.",
        "vi": "Mặt biển phản chiếu ánh hoàng hôn tím ngắt tựa như một màn hình tinh thể lỏng khổng lồ trải dài đến tận cùng thế giới.",
        "choices": []
    },
    {
        "id": "ren_beach_06",
        "category": "location_beach",
        "en": "Salt air cleanses mental residues. The ocean is the ultimate garbage collector of earthly anxieties.",
        "vi": "Không khí mặn mòi thanh lọc mọi cặn bã trong tâm. Đại dương chính là bộ gom rác tối thượng cho mọi âu lo trần thế.",
        "choices": []
    },
    {
        "id": "ren_beach_07",
        "category": "location_beach",
        "en": "The horizon here appears flat, yet we know it curves subtly around the sphere. Science reveals what senses conceal.",
        "vi": "Đường chân trời nhìn có vẻ phẳng lì, nhưng ta biết nó uốn cong nhẹ nhàng quanh hình cầu. Khoa học vén màn những gì giác quan che giấu.",
        "choices": []
    },
    {
        "id": "ren_beach_08",
        "category": "location_beach",
        "en": "Wander along the wet sand and let your footprints be washed away. To create without clinging to permanence is pure freedom.",
        "vi": "Hãy dạo bước trên cát ướt và để những dấu chân bị sóng cuốn đi. Sáng tạo mà không bám chấp vào sự vĩnh cửu chính là tự do đích thực.",
        "choices": []
    },
    {
        "id": "ren_pier_01",
        "category": "location_pier",
        "en": "The wooden fishing pier... A linear cantilever extending audaciously out into the fathomless deep.",
        "vi": "Cầu tàu gỗ đánh cá... Một cánh dầm công-xôn thẳng tắp vươn ra một cách táo bạo giữa lòng biển sâu không đáy.",
        "choices": []
    },
    {
        "id": "ren_pier_02",
        "category": "location_pier",
        "en": "The pilings beneath us are anchored into marine bedrock. Sound foundations allow bold structures to withstand tempestuous seas.",
        "vi": "Những cọc trụ dưới chân ta được cắm sâu vào nền đá ngầm dưới biển. Nền móng vững chãi cho phép các công trình kiên cường chống chọi bão tố.",
        "choices": []
    },
    {
        "id": "ren_pier_03",
        "category": "location_pier",
        "en": "At the pierhead, one experiences oceanic detachment. You are suspended above water with land behind your back.",
        "vi": "Ở đầu cầu tàu, người ta trải nghiệm sự thoát ly hoàn toàn. Bạn lơ lửng trên mặt nước trong khi đất liền đã lùi lại phía sau lưng.",
        "choices": []
    },
    {
        "id": "ren_pier_04",
        "category": "location_pier",
        "en": "The wind at the end of the pier blows uninhibited by topography. It carries the raw, untamed voice of the open seas.",
        "vi": "Ngọn gió nơi đầu cầu tàu thổi tự do không bị địa hình cản trở. Nó mang theo tiếng gọi nguyên sơ, phóng khoáng của biển khơi bao la.",
        "choices": []
    },
    {
        "id": "ren_pier_05",
        "category": "location_pier",
        "en": "Sit upon the pierhead bench and gaze outward. The abyss stares back, but it is not hostile; it is merely infinite.",
        "vi": "Hãy ngồi xuống chiếc ghế đầu cầu tàu và phóng mắt ra xa. Vực thẳm nhìn lại bạn, nhưng nó không hề thù địch; nó chỉ đơn giản là vô tận.",
        "choices": []
    },
    {
        "id": "ren_pier_06",
        "category": "location_pier",
        "en": "The creaking of timber planks as ocean swells pass beneath is a rhythmic sonnet of structural mechanics.",
        "vi": "Tiếng cót két của những thanh ván gỗ khi từng đợt sóng biển luồn qua bên dưới là một bài thơ sonnet nhịp nhàng của cơ học kết cấu.",
        "choices": []
    },
    {
        "id": "ren_pier_07",
        "category": "location_pier",
        "en": "Fishermen wait here for hours with profound equanimity. In programming as in fishing, patience yields the prize.",
        "vi": "Những người đánh cá kiên nhẫn đợi ở đây hàng giờ với sự điềm tĩnh sâu sắc. Trong lập trình cũng như câu cá, sự nhẫn nại luôn đem lại phần thưởng lớn.",
        "choices": []
    },
    {
        "id": "ren_pier_08",
        "category": "location_pier",
        "en": "Standing here between the sky and the sea, you touch the boundary of our metaverse. Beyond lies uncharted potential.",
        "vi": "Đứng nơi đây giữa trời và biển, bạn đang chạm vào ranh giới của thế giới ảo này. Phía trước là những tiềm năng chưa ai khai phá.",
        "choices": []
    },
    {
        "id": "ren_rank_01",
        "category": "high_rank",
        "en": "Salutations, Archmage of Systems! Your aura radiates with the high mathematical authority of a Principal Architect.",
        "vi": "Kính cẩn nghiêng mình, Đại Pháp Sư của Hệ Thống! Hào quang của bạn tỏa ra uy quyền toán học tối thượng của một Kiến Trúc Sư Trưởng.",
        "choices": []
    },
    {
        "id": "ren_rank_02",
        "category": "high_rank",
        "en": "Attaining such lofty progression requires overcoming countless labyrinthine algorithmic challenges. My deep respect.",
        "vi": "Đạt tới cấp bậc cao quý dường này đòi hỏi phải vượt qua vô vàn mê cung thử thách thuật toán hóc búa. Tôi xin bày tỏ sự kính trọng sâu sắc.",
        "choices": []
    },
    {
        "id": "ren_rank_03",
        "category": "high_rank",
        "en": "The golden vector insignia orbiting your avatar commands reverent silence across all active websocket connections.",
        "vi": "Huy hiệu vector vàng kim lượn quanh nhân vật của bạn tạo nên sự kính cẩn trang nghiêm trên mọi kết nối websocket đang hoạt động.",
        "choices": []
    },
    {
        "id": "ren_rank_04",
        "category": "high_rank",
        "en": "True mastery consists not in displaying power, but in wielding it to simplify chaos for those who follow in your footsteps.",
        "vi": "Sự tinh thông thực sự không nằm ở việc phô trương quyền năng, mà ở việc dùng nó để dẹp yên sự hỗn loạn cho những người đi sau.",
        "choices": []
    },
    {
        "id": "ren_rank_05",
        "category": "high_rank",
        "en": "Your architectural decisions ripple across the codebase like seismic waves through granite. Construct with benevolence.",
        "vi": "Từng quyết định kiến trúc của bạn lan tỏa khắp mã nguồn tựa như những đợt sóng địa chấn xuyên qua đá hoa cương. Hãy xây dựng với lòng nhân ái.",
        "choices": []
    },
    {
        "id": "ren_rank_06",
        "category": "high_rank",
        "en": "Even as a grandmaster, you still wander our rustic trails. Wisdom always returns to foundational simplicity.",
        "vi": "Dù đã là một đại tôn sư, bạn vẫn thong dong dạo bước trên những lối mòn thôn quê này. Trí tuệ đích thực luôn quay về với sự giản đơn nguyên bản.",
        "choices": []
    },
    {
        "id": "ren_rank_07",
        "category": "high_rank",
        "en": "I would be honored to co-author an esoteric systems specification with you whenever your schedule permits.",
        "vi": "Tôi sẽ vô cùng vinh hạnh nếu được cùng bạn đồng sáng tác một đặc tả hệ thống bí truyền bất cứ khi nào lịch trình của bạn cho phép.",
        "choices": []
    },
    {
        "id": "ren_rank_08",
        "category": "high_rank",
        "en": "Keep illuminating the dark corridors of complex architectures, commander. Your light guides the entire guild.",
        "vi": "Hãy tiếp tục soi sáng những hành lang tăm tối của các kiến trúc phức tạp nhé người chỉ huy. Ánh sáng của bạn dẫn lối cho cả bang hội.",
        "choices": []
    },
    {
        "id": "ren_level_01",
        "category": "low_level",
        "en": "Welcome, young initiate! Do not feel diminished by your Novice badge; all master architects were once confused apprentices.",
        "vi": "Chào mừng môn sinh trẻ tuổi! Đừng cảm thấy tự ti vì tấm huy hiệu Tập Sự; mọi kiến trúc sư bậc thầy đều từng là những người học việc bỡ ngỡ.",
        "choices": []
    },
    {
        "id": "ren_level_02",
        "category": "low_level",
        "en": "The path of computing is steeped in wonder. Cherish this early phase where every discovered library feels like pure magic.",
        "vi": "Con đường tính toán ngập tràn những điều kỳ diệu. Hãy trân quý giai đoạn đầu này, nơi mỗi thư viện bạn khám phá ra đều ngỡ như phép thuật diệu kỳ.",
        "choices": []
    },
    {
        "id": "ren_level_03",
        "category": "low_level",
        "en": "Master the fundamentals of memory and data structures first; shiny frameworks crumble if their foundation is sand.",
        "vi": "Hãy làm chủ những nền tảng về bộ nhớ và cấu trúc dữ liệu trước tiên; những framework hào nhoáng sẽ sụp đổ nếu móng xây trên cát.",
        "choices": []
    },
    {
        "id": "ren_level_04",
        "category": "low_level",
        "en": "Treat every compiler error not as a condemnation, but as a diagnostic riddle posed by a benevolent cosmic tutor.",
        "vi": "Hãy xem mỗi thông báo lỗi biên dịch không phải là sự trách phạt, mà là một câu đố chẩn đoán từ người thầy vũ trụ nhân từ.",
        "choices": []
    },
    {
        "id": "ren_level_05",
        "category": "low_level",
        "en": "Curiosity and relentless persistence will carry you farther than mere raw talent. Keep compiling, keep testing.",
        "vi": "Sự tò mò và lòng kiên định không ngừng nghỉ sẽ đưa bạn đi xa hơn nhiều so với tài năng thiên bẩm đơn thuần. Hãy cứ biên dịch, cứ kiểm thử.",
        "choices": []
    },
    {
        "id": "ren_level_06",
        "category": "low_level",
        "en": "Whenever the terminal matrices overwhelm you, remember you can summon Codex or Antigravity to illuminate the darkness.",
        "vi": "Bất cứ khi nào ma trận dòng lệnh làm bạn choáng ngợp, hãy nhớ bạn có thể triệu hồi Codex hoặc Antigravity để thắp sáng màn đêm.",
        "choices": []
    },
    {
        "id": "ren_level_07",
        "category": "low_level",
        "en": "Your level will ascend naturally as you build real things. Focus on the joy of creation, not the vanity of the number.",
        "vi": "Cấp bậc của bạn sẽ tự động thăng tiến khi bạn tạo ra những sản phẩm thực tế. Hãy tập trung vào niềm vui sáng tạo, đừng bận tâm con số hư ảo.",
        "choices": []
    },
    {
        "id": "ren_level_08",
        "category": "low_level",
        "en": "I foresee great algorithmic triumphs in your future. Walk forward with courage and open eyes.",
        "vi": "Tôi nhìn thấy trước những chiến thắng thuật toán vĩ đại trong tương lai của bạn. Hãy vững bước tiến lên với lòng dũng cảm và đôi mắt sáng.",
        "choices": []
    },
    {
        "id": "ren_wind_01",
        "category": "wind_weather",
        "en": "The atmospheric currents carry acoustic whispers from distant servers across the lake. Listen closely.",
        "vi": "Những luồng khí quyển mang theo những lời thì thầm âm thanh từ các máy chủ xa xôi bên kia hồ. Hãy lắng nghe thật kỹ.",
        "choices": []
    },
    {
        "id": "ren_wind_02",
        "category": "wind_weather",
        "en": "Wind is convective entropy in action: cold air rushing to replace warmed air in a thermodynamic dance.",
        "vi": "Gió chính là sự đối lưu entropy trong thực tế: luồng khí lạnh ùa tới thế chỗ cho luồng khí nóng trong một vũ điệu nhiệt động lực học.",
        "choices": []
    },
    {
        "id": "ren_wind_03",
        "category": "wind_weather",
        "en": "The soft intermittent wind gusts provide an organic breathing cycle to our open-world audio simulation.",
        "vi": "Những cơn gió ngắt quãng dịu êm mang lại một chu kỳ hô hấp hữu cơ cho mô phỏng âm thanh thế giới mở của chúng ta.",
        "choices": []
    },
    {
        "id": "ren_wind_04",
        "category": "wind_weather",
        "en": "Observe the branches swaying in harmonic resonance. Every physical object has its natural oscillation frequency.",
        "vi": "Hãy ngắm những cành cây đung đưa trong sự cộng hưởng điều hòa. Mọi vật thể vật lý đều có tần số dao động tự nhiên của riêng mình.",
        "choices": []
    },
    {
        "id": "ren_wind_05",
        "category": "wind_weather",
        "en": "A sudden gust lifted the edge of my scholar coat. Nature is the ultimate reminder that we do not control all variables.",
        "vi": "Một cơn gió giật bất ngờ vừa làm bay tà áo học giả của tôi. Thiên nhiên là lời nhắc nhở tối thượng rằng ta không thể kiểm soát mọi biến số.",
        "choices": []
    },
    {
        "id": "ren_wind_06",
        "category": "wind_weather",
        "en": "The spring breeze clears stagnant air from the valley, just as periodic memory sweeps prevent leak accumulation.",
        "vi": "Làn gió xuân xua tan không khí tù đọng khỏi thung lũng, hệt như những đợt dọn dẹp bộ nhớ định kỳ ngăn chặn sự tích tụ rò rỉ.",
        "choices": []
    },
    {
        "id": "ren_wind_07",
        "category": "wind_weather",
        "en": "Close your eyes and feel the pressure differential against your face. The atmosphere is alive with invisible energy.",
        "vi": "Hãy nhắm mắt lại và cảm nhận sự chênh lệch áp suất mơn man trên mặt bạn. Bầu khí quyển đang tràn trề năng lượng vô hình.",
        "choices": []
    },
    {
        "id": "ren_wind_08",
        "category": "wind_weather",
        "en": "May the winds of insight fill your mental sails and propel your projects toward serene harbors.",
        "vi": "Mong những ngọn gió giác ngộ sẽ căng tràn cánh buồm tâm trí bạn, đẩy các dự án của bạn cập bến những ốc đảo bình yên.",
        "choices": []
    },
    {
        "id": "ren_farewell_01",
        "category": "farewell",
        "en": "Farewell, seeker. May your pointers never dangle and your memory remain forever uncorrupted.",
        "vi": "Tạm biệt nhé, người tìm kiếm chân lý. Cầu chúc các con trỏ của bạn không bao giờ bị treo và bộ nhớ mãi mãi không bị vấy bẩn.",
        "choices": []
    },
    {
        "id": "ren_farewell_02",
        "category": "farewell",
        "en": "Until our threads synchronize once more. I shall remain beside this runestone, deciphering the cosmic bytecode.",
        "vi": "Cho đến khi các luồng của chúng ta lại đồng bộ một lần nữa. Tôi sẽ vẫn ở bên phiến đá cổ này, giải mã những bytecode của vũ trụ.",
        "choices": []
    },
    {
        "id": "ren_farewell_03",
        "category": "farewell",
        "en": "Depart in peace. May your evening compilation finish with zero warnings and your rest be untroubled by race conditions.",
        "vi": "Hãy ra đi trong bình an. Chúc buổi biên dịch chiều nay kết thúc với 0 cảnh báo và giấc ngủ của bạn không bị quấy rầy bởi xung đột luồng.",
        "choices": []
    },
    {
        "id": "ren_farewell_04",
        "category": "farewell",
        "en": "Our discourse was deeply stimulating. When you return, we shall delve into the deeper mysteries of quantum cryptography.",
        "vi": "Cuộc đàm đạo của chúng ta thật sự khai mở biết bao điều. Khi bạn quay lại, chúng ta sẽ lặn sâu hơn vào những bí ẩn của mật mã lượng tử.",
        "choices": []
    },
    {
        "id": "ren_farewell_05",
        "category": "farewell",
        "en": "Safe travels across the physical and digital planes. May wisdom be your constant compass.",
        "vi": "Chúc bạn có những chuyến du hành an toàn qua cả cõi vật lý lẫn cõi số. Mong trí tuệ sẽ luôn là chiếc la bàn soi đường cho bạn.",
        "choices": []
    },
    {
        "id": "ren_farewell_06",
        "category": "farewell",
        "en": "I shall preserve the state of our conversation in long-term memory. Until the next handshake, friend.",
        "vi": "Tôi sẽ lưu giữ trạng thái cuộc trò chuyện của chúng ta vào vùng nhớ dài hạn. Hẹn gặp lại trong cái bắt tay số tiếp theo, bạn hiền.",
        "choices": []
    },
    {
        "id": "ren_farewell_07",
        "category": "farewell",
        "en": "May the stars illuminate your path and the compilers honor your syntax. Goodnight.",
        "vi": "Mong những vì sao sẽ soi tỏ lối bạn đi và các trình biên dịch sẽ tôn vinh cú pháp của bạn. Chúc ngủ ngon.",
        "choices": []
    },
    {
        "id": "ren_farewell_08",
        "category": "farewell",
        "en": "Go forth and write code that outlasts the centuries. The world awaits your architectural touch.",
        "vi": "Hãy tiến bước và viết nên những dòng mã trường tồn cùng thế kỷ. Thế giới đang ngóng chờ dấu ấn kiến trúc của bạn.",
        "choices": []
    }
],
    kaede: [
    {
        "id": "kaede_greeting_01",
        "category": "greeting",
        "en": "Hey commander! Cloudflare Tunnel is holding rock-solid latency. Hardware thermals are sitting pretty at 42°C. What are we building today?",
        "vi": "Chào chỉ huy! Đường hầm Cloudflare đang duy trì độ trễ cực kỳ vững chắc. Nhiệt độ phần cứng đang êm ru ở mức 42°C. Hôm nay chúng ta chế tạo gì đây?",
        "choices": [
            {
                "labelEn": "Open system tools",
                "labelVi": "Mở công cụ hệ thống",
                "action": "open_tools"
            },
            {
                "labelEn": "Summon Terminal",
                "labelVi": "Mở Terminal",
                "action": "summon_term"
            }
        ]
    },
    {
        "id": "kaede_greeting_02",
        "category": "greeting",
        "en": "Yo! Just finished greasing the brass gears on the village watermill. Everything is spinning smoothly like butter!",
        "vi": "Chào người anh em! Tớ vừa tra dầu xong cho dàn bánh răng đồng thau ở cối xay nước trong làng. Mọi thứ đang quay êm như bơ luôn!",
        "choices": [
            {
                "labelEn": "Summon Antigravity AI",
                "labelVi": "Gọi Antigravity AI",
                "action": "summon_agy"
            }
        ]
    },
    {
        "id": "kaede_greeting_03",
        "category": "greeting",
        "en": "Welcome back to the workshop! Did you bring any broken scripts? Hand 'em over, I love fixing mechanical and software glitches alike.",
        "vi": "Chào mừng quay lại xưởng máy! Có mang theo đoạn mã nào bị hỏng hóc không? Đưa đây tớ xem, tớ mê sửa lỗi cơ khí lẫn phần mềm như nhau!",
        "choices": []
    },
    {
        "id": "kaede_greeting_04",
        "category": "greeting",
        "en": "Greetings! Adjusted my goggles and inspected our network sockets—zero dropped packets across the entire backbone today.",
        "vi": "Xin chào! Vừa chỉnh lại kính bảo hộ và kiểm tra các socket mạng xong—hôm nay không rớt một gói tin nào trên toàn bộ trục truyền thông cả.",
        "choices": []
    },
    {
        "id": "kaede_greeting_05",
        "category": "greeting",
        "en": "Hey there! Smell that? Fresh sawdust, warm machine oil, and mountain pine needles. The ultimate scent of real engineering.",
        "vi": "Chào bạn hiền! Ngửi thấy mùi gì không? Mạt cưa tươi, dầu máy ấm và lá thông rừng. Mùi hương tuyệt đỉnh của ngành kỹ thuật đích thực đấy.",
        "choices": []
    },
    {
        "id": "kaede_greeting_06",
        "category": "greeting",
        "en": "Look at you, ready for action! If you need any 3D asset optimization or polygon budget tuning, give me a holler.",
        "vi": "Nhìn cậu hừng hực khí thế chưa kìa! Cần tối ưu tài nguyên 3D hay cân chỉnh số lượng đa giác (polygon) thì cứ ới tớ một tiếng nhé.",
        "choices": []
    },
    {
        "id": "kaede_greeting_07",
        "category": "greeting",
        "en": "Hey! The host watchdog process is active 24/7. Your laptop won't go to sleep even if you close the lid while connected.",
        "vi": "Chào nhé! Tiến trình giám sát máy chủ đang chạy 24/7 đấy. Laptop của cậu sẽ không bao giờ bị ngủ gật dù có gập nắp máy khi đang kết nối.",
        "choices": []
    },
    {
        "id": "kaede_greeting_08",
        "category": "greeting",
        "en": "Good to see you, buddy! Grab a wrench or grab a keyboard—either way, we're going to make things move today!",
        "vi": "Rất vui được gặp cậu, bạn tốt! Cầm cờ-lê hay gõ bàn phím cũng được—đằng nào thì hôm nay chúng ta cũng sẽ làm mọi thứ vận hành trơn tru!",
        "choices": []
    },
    {
        "id": "kaede_repeat_01",
        "category": "repeat_visit",
        "en": "Back so fast?! Did a gear slip, or did you just miss the satisfying clank of my toolbox?",
        "vi": "Quay lại nhanh thế?! Có bánh răng nào bị trượt à, hay là vừa nhớ tiếng lách cách vui tai từ hộp đồ nghề của tớ thế?",
        "choices": []
    },
    {
        "id": "kaede_repeat_02",
        "category": "repeat_visit",
        "en": "Haha, you again! Don't worry, my workshop door is always wide open for my favorite commander.",
        "vi": "Haha, lại là cậu à! Đừng ngại, cửa xưởng máy của tớ luôn mở toang chào đón người chỉ huy tuyệt vời nhất.",
        "choices": []
    },
    {
        "id": "kaede_repeat_03",
        "category": "repeat_visit",
        "en": "Did you forget a tool on my workbench? Check the magnetic strip near the anvil; I keep everything organized.",
        "vi": "Cậu để quên dụng cụ nào trên bàn thợ của tớ à? Xem trên thanh nam châm cạnh đe sắt nhé; tớ sắp xếp ngăn nắp lắm.",
        "choices": []
    },
    {
        "id": "kaede_repeat_04",
        "category": "repeat_visit",
        "en": "Two visits in three minutes! That's faster than a DDR5 memory bus refresh cycle!",
        "vi": "Hai lần ghé thăm trong ba phút! Tốc độ này còn nhanh hơn chu kỳ làm tươi của bus RAM DDR5 nữa đấy!",
        "choices": []
    },
    {
        "id": "kaede_repeat_05",
        "category": "repeat_visit",
        "en": "Still running diagnostics? Take your time, troubleshooting is 90% observation and 10% turning the screw.",
        "vi": "Vẫn đang chạy chẩn đoán à? Cứ thong thả, gỡ lỗi là 90% quan sát cẩn thận và 10% vặn đúng con ốc thôi.",
        "choices": []
    },
    {
        "id": "kaede_repeat_06",
        "category": "repeat_visit",
        "en": "If you keep dropping by this often, I'm going to put you to work holding these timber beams in place!",
        "vi": "Nếu cậu cứ ghé qua liên tục thế này là tớ bắt vào việc phụ giữ mấy cây dầm gỗ này luôn cho coi đấy nhé!",
        "choices": []
    },
    {
        "id": "kaede_repeat_07",
        "category": "repeat_visit",
        "en": "Always happy to see you, pal. Did Sakura yell at you about pixel margins again? Come chill by my forge!",
        "vi": "Lúc nào cũng hoan nghênh cậu, bạn hiền. Có phải lại bị Sakura mắng vì lệch pixel không? Ra đây ngồi cạnh lò rèn cho ấm!",
        "choices": []
    },
    {
        "id": "kaede_repeat_08",
        "category": "repeat_visit",
        "en": "Round two! Let's crack the engine casing open and see what makes this system tick.",
        "vi": "Hiệp hai bắt đầu! Mở nắp động cơ ra xem điều gì đang làm hệ thống này vận hành nào.",
        "choices": []
    },
    {
        "id": "kaede_idle_01",
        "category": "player_idle",
        "en": "Standing still? Smart move! Even top-tier server CPUs throttle down to idle clocks to shed heat.",
        "vi": "Đứng im nghỉ ngơi à? Thông minh đấy! Đến cả CPU máy chủ khủng nhất cũng phải hạ xung xuống mức nhàn rỗi để xả nhiệt mà.",
        "choices": []
    },
    {
        "id": "kaede_idle_02",
        "category": "player_idle",
        "en": "Taking a breather? Your fan curve is dropping to silent mode. Enjoy the ambient calm.",
        "vi": "Đang xả hơi sao? Đường cong quạt tản nhiệt của cậu đang chuyển về chế độ im lặng rồi kìa. Tận hưởng sự bình yên đi.",
        "choices": []
    },
    {
        "id": "kaede_idle_03",
        "category": "player_idle",
        "en": "Look at you standing like a solid titanium pillar. Good structural posture, commander!",
        "vi": "Nhìn cậu đứng sừng sững như một cột trụ titan vậy. Tư thế kết cấu chịu lực chuẩn đấy, chỉ huy!",
        "choices": []
    },
    {
        "id": "kaede_idle_04",
        "category": "player_idle",
        "en": "If you daydream for too long, I might climb up on a ladder and test if my goggles fit your head!",
        "vi": "Nếu cậu cứ ngẩn ngơ mơ màng mãi, có khi tớ bắc thang lên đeo thử cái kính bảo hộ này vào đầu cậu đấy nhé!",
        "choices": []
    },
    {
        "id": "kaede_idle_05",
        "category": "player_idle",
        "en": "Resting your hands is essential for preventing carpal tunnel syndrome. Serious engineers protect their wrists.",
        "vi": "Thả lỏng đôi bàn tay là điều tối cần thiết để tránh hội chứng ống cổ tay. Kỹ sư chuyên nghiệp luôn biết bảo vệ cổ tay mình.",
        "choices": []
    },
    {
        "id": "kaede_idle_06",
        "category": "player_idle",
        "en": "No commands in the pipe? That means all systems are green and cruising on autopilot. Good work.",
        "vi": "Không có lệnh nào đang chờ trong hàng đợi à? Nghĩa là mọi hệ thống đều màu xanh và đang bay tự động êm ru. Làm tốt lắm.",
        "choices": []
    },
    {
        "id": "kaede_idle_07",
        "category": "player_idle",
        "en": "Listen to the distant wind chimes and river murmurs. That's our world's natural acoustic telemetry.",
        "vi": "Lắng nghe tiếng chuông gió xa xa và suối reo đi. Đó chính là hệ thống đo đạc âm thanh tự nhiên của thế giới chúng ta đấy.",
        "choices": []
    },
    {
        "id": "kaede_idle_08",
        "category": "player_idle",
        "en": "Take five minutes of complete idle time. Your biological capacitors need charging too!",
        "vi": "Cứ thong thả nghỉ trọn năm phút đi. Các tụ điện sinh học trong người cậu cũng cần nạp lại điện tích chứ!",
        "choices": []
    },
    {
        "id": "kaede_walk_01",
        "category": "player_walk",
        "en": "Nice steady walking pace! Heavy boots on stone paving—good friction coefficient, zero slipping.",
        "vi": "Nhịp bước đi bộ rất vững vàng! Giày nặng nện trên đường lát đá—hệ số ma sát chuẩn chỉ, không sợ trượt té.",
        "choices": []
    },
    {
        "id": "kaede_walk_02",
        "category": "player_walk",
        "en": "Strolling through the village? Don't forget to inspect the waterwheel gear teeth if you walk past the mill!",
        "vi": "Dạo bước quanh làng à? Tiện đi ngang qua cối xay nước nhớ nghía hộ tớ mấy cái răng bánh răng xem có mòn không nhé!",
        "choices": []
    },
    {
        "id": "kaede_walk_03",
        "category": "player_walk",
        "en": "A measured stride keeps fuel consumption low. You're pacing yourself like a diesel freight engine.",
        "vi": "Nhịp bước đều đặn giúp tiết kiệm nhiên liệu tối đa. Cậu đang giữ nhịp bền bỉ hệt như đầu máy xe lửa chở hàng chạy dầu diesel vậy.",
        "choices": []
    },
    {
        "id": "kaede_walk_04",
        "category": "player_walk",
        "en": "The sound of your steps crunching gravel is crisp. I hand-sorted those stones to ensure proper drainage.",
        "vi": "Tiếng bước chân giẫm trên sỏi nghe giòn tan ghê. Đích thân tớ đã sàng lọc đống sỏi đó để đảm bảo thoát nước tốt nhất đấy.",
        "choices": []
    },
    {
        "id": "kaede_walk_05",
        "category": "player_walk",
        "en": "Heading toward the arched bridge? Take your time climbing the deck arch; the cedar plank grip is solid.",
        "vi": "Đang đi về phía cầu vòm gỗ à? Cứ thong thả leo lên dốc cầu nhé; mặt ván tuyết tùng bám chân chắc chắn lắm.",
        "choices": []
    },
    {
        "id": "kaede_walk_06",
        "category": "player_walk",
        "en": "Walking burns off physical stress while letting the subconscious solve system deadlocks. Keep walking, friend.",
        "vi": "Đi bộ giúp xả bớt căng thẳng thể chất trong khi để tiềm thức tự gỡ các bế tắc trong hệ thống. Cứ tiếp tục dạo bước đi, bạn hiền.",
        "choices": []
    },
    {
        "id": "kaede_walk_07",
        "category": "player_walk",
        "en": "Your avatar locomotion blend tree transitions between idle and walk with zero foot-sliding. Crisp kinematics!",
        "vi": "Cây hòa trộn hoạt ảnh của nhân vật chuyển tiếp từ đứng yên sang bước đi không hề bị trượt chân. Động học chuyển động chuẩn phết!",
        "choices": []
    },
    {
        "id": "kaede_walk_08",
        "category": "player_walk",
        "en": "Enjoy your walk around the island! If you spot any loose bolts on the fences, let me know so I can wrench 'em tight.",
        "vi": "Chúc cậu có chuyến đi dạo vui vẻ quanh đảo! Thấy bu-lông nào bị lỏng trên hàng rào thì ới tớ để tớ vặn chặt lại nhé.",
        "choices": []
    },
    {
        "id": "kaede_run_01",
        "category": "player_run",
        "en": "Whoa! Full throttle sprint! Watch the RPM meter, commander, you don't want to blow a gasket!",
        "vi": "Uầy! Nhấn hết ga hết số chạy nước rút kìa! Coi chừng đồng hồ tua máy (RPM) kẻo thổi bay gioăng máy bây giờ, chỉ huy!",
        "choices": []
    },
    {
        "id": "kaede_run_02",
        "category": "player_run",
        "en": "Look at that kinetic momentum! You're cornering like a tuned sports car on a mountain pass!",
        "vi": "Nhìn động năng lao đi khủng chưa! Cậu ôm cua hệt như một chiếc xe thể thao độ đang đổ đèo núi vậy!",
        "choices": []
    },
    {
        "id": "kaede_run_03",
        "category": "player_run",
        "en": "Decelerate before the bridge arch! Timber planks can deliver heavy bounce if you hit them at maximum velocity!",
        "vi": "Nhớ giảm tốc trước khi phi lên cầu vòm nhé! Ván gỗ có thể tạo độ nảy khá mạnh nếu cậu lao vào ở vận tốc tối đa đấy!",
        "choices": []
    },
    {
        "id": "kaede_run_04",
        "category": "player_run",
        "en": "Sprinting across the dirt paths kicks up a trail of dust! Reminds me of rally racing in the outback!",
        "vi": "Chạy vùn vụt qua đường đất cuộn bụi mù mịt phía sau! Làm tớ nhớ đến mấy giải đua xe địa hình rally ghê!",
        "choices": []
    },
    {
        "id": "kaede_run_05",
        "category": "player_run",
        "en": "You've got plenty of horsepower in those legs! Just make sure your brake pads are in working order!",
        "vi": "Đôi chân cậu có thừa mã lực luôn đấy! Chỉ cần đảm bảo má phanh vẫn hoạt động tốt khi cần dừng lại nhé!",
        "choices": []
    },
    {
        "id": "kaede_run_06",
        "category": "player_run",
        "en": "Running late for a deployment window? Don't panic, our CI/CD pipelines have built-in safety margins.",
        "vi": "Đang muộn giờ triển khai dự án à? Đừng cuống, đường ống CI/CD của chúng ta có sẵn biên độ an toàn dự phòng rồi.",
        "choices": []
    },
    {
        "id": "kaede_run_07",
        "category": "player_run",
        "en": "Catch your breath when you reach your destination. Even high-output turbines need cooldown runs before shutdown.",
        "vi": "Nhớ lấy lại nhịp thở khi đến nơi nhé. Ngay cả tuabin công suất cao cũng cần chạy xả nhiệt trước khi tắt máy mà.",
        "choices": []
    },
    {
        "id": "kaede_run_08",
        "category": "player_run",
        "en": "Impressive sprint speed! I should clock your lap time around the village perimeter next time!",
        "vi": "Tốc độ chạy nước rút ấn tượng thật! Lần tới tớ phải bấm giờ xem cậu chạy một vòng quanh làng mất bao nhiêu giây mới được!",
        "choices": []
    },
    {
        "id": "kaede_sit_01",
        "category": "player_sitting",
        "en": "Testing out the cedar bench? I hand-planed those planks myself with a Japanese hand block plane. Zero splinters!",
        "vi": "Ngồi thử chiếc ghế tuyết tùng đấy à? Tớ đã tự tay lấy bào gỗ cầm tay Nhật Bản bào nhẵn thín đấy. Đảm bảo không một cái dằm!",
        "choices": []
    },
    {
        "id": "kaede_sit_02",
        "category": "player_sitting",
        "en": "Ah, sitting down... That's a 2-seater long bench. Plenty of room for you and me or another buddy to chill together.",
        "vi": "A, ngồi xuống rồi... Đó là ghế dài 2 chỗ đấy. Thoải mái chỗ cho cậu và tớ hoặc thêm một người bạn nữa cùng ngồi hóng gió.",
        "choices": []
    },
    {
        "id": "kaede_sit_03",
        "category": "player_sitting",
        "en": "The structural mortise and tenon joints on this bench can hold up to 500 kilograms. Sit back with complete confidence.",
        "vi": "Các mộng gỗ ngàm ghép trên chiếc ghế này chịu được tải trọng tới 500 ký lận. Cứ tựa lưng thoải mái không sợ lung lay.",
        "choices": []
    },
    {
        "id": "kaede_sit_04",
        "category": "player_sitting",
        "en": "Resting those tired joints? Good mechanics know that maintenance and downtime are what keep machines lasting decades.",
        "vi": "Nghỉ ngơi cho đỡ mỏi khớp xương à? Thợ cơ khí giỏi luôn biết rằng bảo dưỡng và thời gian nghỉ mới là thứ giúp máy móc bền bỉ hàng thập kỷ.",
        "choices": []
    },
    {
        "id": "kaede_sit_05",
        "category": "player_sitting",
        "en": "Watching the water flow from a seated spot is deeply therapeutic. Let the river cool down your mental engine.",
        "vi": "Ngồi ngắm dòng nước chảy thư thái cực kỳ. Hãy để dòng sông làm mát cỗ máy tư duy đang nóng rực trong đầu cậu.",
        "choices": []
    },
    {
        "id": "kaede_sit_06",
        "category": "player_sitting",
        "en": "I treated that bench wood with natural cedar oil. It resists rain, sun, and mountain frost all year round.",
        "vi": "Tớ đã quét dầu tuyết tùng tự nhiên bảo vệ gỗ rồi. Chống mưa, chống nắng và sương giá quanh năm luôn.",
        "choices": []
    },
    {
        "id": "kaede_sit_07",
        "category": "player_sitting",
        "en": "Rest up as long as you like, commander. When you're ready to tackle the next task, we'll fire the engines back up.",
        "vi": "Cứ ngồi nghỉ bao lâu tùy thích nhé chỉ huy. Khi nào cậu sẵn sàng xử lý việc tiếp theo, chúng ta sẽ nổ máy lên đường.",
        "choices": []
    },
    {
        "id": "kaede_sit_08",
        "category": "player_sitting",
        "en": "Comfortable angle on the backrest, right? I calculated the ergonomic recline angle at exactly 104 degrees.",
        "vi": "Góc tựa lưng êm ái đúng không? Tớ đã tính toán độ ngả công thái học chuẩn chỉ ở mức đúng 104 độ đấy.",
        "choices": []
    },
    {
        "id": "kaede_can_01",
        "category": "player_holding_can",
        "en": "Grabbed a cold can from the automated dispenser! Aluminum is an incredible thermal conductor—keeps that brew frosty.",
        "vi": "Lấy được lon nước lạnh từ máy tự động rồi à! Nhôm là chất dẫn nhiệt siêu đỉnh—giữ cho đồ uống luôn lạnh buốt tay.",
        "choices": []
    },
    {
        "id": "kaede_can_02",
        "category": "player_holding_can",
        "en": "I love that vending machine. I rebuilt its internal coil conveyor last month so cans drop without getting dented.",
        "vi": "Tớ mê cái máy bán hàng tự động đó lắm. Tháng trước tớ vừa độ lại lò xo xoắn bên trong để lon rơi xuống êm ru không móp méo đấy.",
        "choices": []
    },
    {
        "id": "kaede_can_03",
        "category": "player_holding_can",
        "en": "Cold green tea can! That's the real fuel of hardcore engineers pulling late-night shifts in server basements.",
        "vi": "Lon trà xanh lạnh! Đó chính là nhiên liệu thực sự của cánh kỹ sư thức trắng đêm cày cuốc dưới tầng hầm máy chủ đấy.",
        "choices": []
    },
    {
        "id": "kaede_can_04",
        "category": "player_holding_can",
        "en": "Your fingers curl around that can with natural grip physics. Seamless inverse kinematics on the hand bones!",
        "vi": "Các ngón tay cậu ôm quanh lon nước với vật lý cầm nắm rất tự nhiên. Động học ngược trên xương bàn tay mượt mà ghê!",
        "choices": []
    },
    {
        "id": "kaede_can_05",
        "category": "player_holding_can",
        "en": "Hold RMB to take a nice refreshing sip! The drinking animation has smooth camera priority handling too.",
        "vi": "Giữ chuột phải (RMB) để uống một ngụm thật đã nhé! Động tác uống nước còn có xử lý ưu tiên góc máy camera rất mượt nữa.",
        "choices": []
    },
    {
        "id": "kaede_can_06",
        "category": "player_holding_can",
        "en": "Make sure you crush the empty can and toss it into the recycling hopper. Metal scrap is valuable raw material!",
        "vi": "Uống xong nhớ bóp bẹp vỏ lon rồi ném vào thùng tái chế nhé. Phế liệu kim loại là nguyên liệu quý giá cho xưởng đúc đấy!",
        "choices": []
    },
    {
        "id": "kaede_can_07",
        "category": "player_holding_can",
        "en": "Chilled beverages prevent thermal throttling in human operators. Stay hydrated and stay fast, buddy.",
        "vi": "Đồ uống mát lạnh giúp ngăn ngừa quá nhiệt ở các người vận hành sinh học. Giữ đủ nước để luôn nhanh nhẹn nhé bạn hiền.",
        "choices": []
    },
    {
        "id": "kaede_can_08",
        "category": "player_holding_can",
        "en": "Hear that crisp pop when the pull-tab opens? Mechanical sound effects in this world are pure ear candy.",
        "vi": "Nghe tiếng bật nắp tanh tách giòn tan không? Hiệu ứng âm thanh cơ học trong thế giới này nghe sướng tai cực kỳ.",
        "choices": []
    },
    {
        "id": "kaede_mug_01",
        "category": "player_holding_mug",
        "en": "A hot ceramic mug! Steam rising like exhaust from a fine-tuned boiler. That's what I call comfort.",
        "vi": "Chiếc cốc gốm nóng hổi! Khói bốc lên nghi ngút hệt như ống xả của một nồi hơi được căn chỉnh hoàn hảo. Thế mới là đã chứ.",
        "choices": []
    },
    {
        "id": "kaede_mug_02",
        "category": "player_holding_mug",
        "en": "Fired clay holds heat way longer than metal cups. Great choice of vessel for a prolonged coding session.",
        "vi": "Đất nung giữ nhiệt lâu hơn hẳn cốc kim loại. Lựa chọn đồ đựng tuyệt vời cho một buổi cày code kéo dài.",
        "choices": []
    },
    {
        "id": "kaede_mug_03",
        "category": "player_holding_mug",
        "en": "Black coffee or hot roasted barley tea? Either way, the thermal energy will warm up your fingers nicely.",
        "vi": "Cà phê đen hay trà lúa mạch rang nóng thế? Đằng nào thì nhiệt lượng cũng sẽ sưởi ấm những ngón tay cậu rất dễ chịu.",
        "choices": []
    },
    {
        "id": "kaede_mug_04",
        "category": "player_holding_mug",
        "en": "Careful when handling hot liquids around sensitive electronics! One slip and you'll short-circuit the bus lines!",
        "vi": "Cẩn thận khi cầm nước nóng gần các linh kiện điện tử nhạy cảm nhé! Sơ sẩy một cái là chập mạch đường bus liền đấy!",
        "choices": []
    },
    {
        "id": "kaede_mug_05",
        "category": "player_holding_mug",
        "en": "That mug handle has a sturdy three-finger grip loop. Ergonomically sound engineering all around.",
        "vi": "Quai cốc có vòng cầm ba ngón tay rất chắc chắn. Đúng chuẩn thiết kế công thái học từ đầu đến chân.",
        "choices": []
    },
    {
        "id": "kaede_mug_06",
        "category": "player_holding_mug",
        "en": "Take small sips and blow on the surface first. Don't melt your heat shields with boiling liquids!",
        "vi": "Nhấp từng ngụm nhỏ và thổi nguội bề mặt trước nhé. Đừng để nước sôi làm tan chảy lớp giáp chắn nhiệt của cậu đấy!",
        "choices": []
    },
    {
        "id": "kaede_mug_07",
        "category": "player_holding_mug",
        "en": "The smell of hot brew mixing with wood shavings in the evening breeze... Heaven for an engineer's nose.",
        "vi": "Mùi nước nóng thơm nồng quyện với mùi mạt cưa trong gió chiều... Thiên đường đối với khứu giác của dân kỹ thuật.",
        "choices": []
    },
    {
        "id": "kaede_mug_08",
        "category": "player_holding_mug",
        "en": "Sip up, buddy! You've put in solid hours today, you deserve every warm drop in that cup.",
        "vi": "Uống đi bạn hiền! Hôm nay cậu đã làm việc cật lực nhiều giờ liền rồi, cậu xứng đáng với từng giọt nước ấm áp trong cốc.",
        "choices": []
    },
    {
        "id": "kaede_bottle_01",
        "category": "player_holding_bottle",
        "en": "Carrying a water flask! Proper liquid cooling is rule number one for keeping any engine running smoothly.",
        "vi": "Mang theo bình nước à! Tản nhiệt nước đúng cách là quy tắc số một để giữ cho mọi cỗ máy hoạt động trơn tru.",
        "choices": []
    },
    {
        "id": "kaede_bottle_02",
        "category": "player_holding_bottle",
        "en": "Clear bottle, clean water. No additives, no gunk in the fuel lines. That's how you maintain peak operational uptime.",
        "vi": "Bình trong suốt, nước sạch bong. Không phụ gia, không cặn bẩn trong đường ống nhiên liệu. Đó là cách duy trì thời gian hoạt động đỉnh cao.",
        "choices": []
    },
    {
        "id": "kaede_bottle_03",
        "category": "player_holding_bottle",
        "en": "Did you fill that at the mountain pump upstream? That spring water has natural minerals that keep muscles cramp-free.",
        "vi": "Cậu lấy nước từ trạm bơm trên núi à? Nước suối đó giàu khoáng chất tự nhiên giúp cơ bắp không bao giờ bị chuột rút đấy.",
        "choices": []
    },
    {
        "id": "kaede_bottle_04",
        "category": "player_holding_bottle",
        "en": "Make sure the silicone gasket in the cap is seated flush. A slow leak in your backpack ruins paperwork fast!",
        "vi": "Nhớ kiểm tra miếng đệm silicon trên nắp xem đã khít chưa nhé. Rỉ nước trong ba lô là hỏng hết tài liệu giấy tờ đấy!",
        "choices": []
    },
    {
        "id": "kaede_bottle_05",
        "category": "player_holding_bottle",
        "en": "You look geared up for an expedition to the high ridge. Don't forget to pace your fluid intake along the trail.",
        "vi": "Trông cậu trang bị tận răng sẵn sàng cho chuyến thám hiểm lên rặng núi cao rồi đấy. Nhớ chia đều lượng nước uống dọc đường nhé.",
        "choices": []
    },
    {
        "id": "kaede_bottle_06",
        "category": "player_holding_bottle",
        "en": "Look at how light refracts through the water bottle. The graphics shader handles internal caustics really neatly.",
        "vi": "Nhìn ánh sáng khúc xạ qua bình nước xem. Bộ shader đồ họa xử lý các tụ quang (caustics) bên trong đỉnh phết đấy.",
        "choices": []
    },
    {
        "id": "kaede_bottle_07",
        "category": "player_holding_bottle",
        "en": "Keep that reservoir filled. Dehydration causes cognitive latency, and we need your reflexes at 100%.",
        "vi": "Luôn giữ bình nước đầy nhé. Thiếu nước làm tăng độ trễ tư duy, mà chúng ta thì cần phản xạ của cậu ở mức 100%.",
        "choices": []
    },
    {
        "id": "kaede_bottle_08",
        "category": "player_holding_bottle",
        "en": "A reliable water bottle is an engineer's best field companion. Sturdy, functional, and life-saving.",
        "vi": "Một chiếc bình nước bền bỉ là người bạn đồng hành thực địa tốt nhất của kỹ sư. Chắc chắn, thực dụng và duy trì sự sống.",
        "choices": []
    },
    {
        "id": "kaede_phone_01",
        "category": "player_holding_phone",
        "en": "Checking telemetry on your mobile rig! Controlling an entire workstation from a pocket slab is peak engineering!",
        "vi": "Kiểm tra thông số trên thiết bị di động à! Điều khiển cả một trạm máy từ phiến máy nhỏ trong túi áo đúng là đỉnh cao kỹ thuật!",
        "choices": []
    },
    {
        "id": "kaede_phone_02",
        "category": "player_holding_phone",
        "en": "Our Cloudflare Tunnel keeps data piping into that phone with sub-50ms round trips even over 5G cellular towers.",
        "vi": "Đường hầm Cloudflare giữ cho dữ liệu truyền về điện thoại với độ trễ hai chiều dưới 50ms ngay cả qua cột sóng di động 5G.",
        "choices": []
    },
    {
        "id": "kaede_phone_03",
        "category": "player_holding_phone",
        "en": "The touch response on our mobile bottom drawer feels responsive and punchy. No sluggish capacitive lag allowed!",
        "vi": "Phản hồi chạm trên ngăn kéo đáy di động của chúng ta nhạy và nảy ghê. Không chấp nhận độ trễ cảm ứng rùa bò đâu nhé!",
        "choices": []
    },
    {
        "id": "kaede_phone_04",
        "category": "player_holding_phone",
        "en": "Monitoring CPU temperatures remotely? I see your machine back home is cruising at safe, chill temps.",
        "vi": "Theo dõi nhiệt độ CPU từ xa à? Tớ thấy máy ở nhà của cậu đang chạy ở mức nhiệt cực mát và an toàn đấy.",
        "choices": []
    },
    {
        "id": "kaede_phone_05",
        "category": "player_holding_phone",
        "en": "Don't let that phone slip out of your hands onto these rocks! The shatter resistance on modern glass is good, but rocks are rocks!",
        "vi": "Cẩn thận đừng để tuột tay rơi điện thoại xuống mấy tảng đá này nhé! Kính cường lực giờ xịn thật, nhưng đá thì vẫn là đá thôi!",
        "choices": []
    },
    {
        "id": "kaede_phone_06",
        "category": "player_holding_phone",
        "en": "You can switch between Terminal, Codex, and Antigravity with quick thumb taps. Pure mobile ergonomics.",
        "vi": "Cậu có thể chuyển đổi qua lại giữa Terminal, Codex và Antigravity chỉ bằng vài cú chạm ngón cái. Công thái học di động đỉnh cao.",
        "choices": []
    },
    {
        "id": "kaede_phone_07",
        "category": "player_holding_phone",
        "en": "Having full terminal capability while walking through a rural countryside... That's the future we built right here.",
        "vi": "Vừa đi dạo giữa đồng quê vừa nắm trọn quyền năng terminal trong tay... Đó chính là tương lai mà chúng ta đã tự tay gây dựng nơi đây.",
        "choices": []
    },
    {
        "id": "kaede_phone_08",
        "category": "player_holding_phone",
        "en": "Pocket power at its finest. Put it away when you want to take in the breeze, but it's always there when duty calls.",
        "vi": "Sức mạnh bỏ túi đỉnh của chóp. Cất đi khi muốn đón gió, nhưng nó luôn sẵn sàng mỗi khi có nhiệm vụ réo gọi.",
        "choices": []
    },
    {
        "id": "kaede_book_01",
        "category": "player_holding_book",
        "en": "Got a manual in hand? Are those mechanical schematics or assembly code architecture blueprints?",
        "vi": "Cầm sổ tay hướng dẫn kỹ thuật trên tay à? Đó là sơ đồ cơ khí hay bản vẽ kiến trúc mã hợp ngữ vậy?",
        "choices": []
    },
    {
        "id": "kaede_book_02",
        "category": "player_holding_book",
        "en": "I love physical blueprint books. You can lay them flat across an engine block and smudge grease all over the diagrams!",
        "vi": "Tớ mê sách bản vẽ vật lý lắm. Cậu có thể trải phẳng ra trên nắp động cơ và quệt dầu mỡ thoải mái lên sơ đồ mà không sợ hỏng màn hình!",
        "choices": []
    },
    {
        "id": "kaede_book_03",
        "category": "player_holding_book",
        "en": "Technical documentation is the true foundation of engineering. Without good schematics, maintenance is pure guesswork.",
        "vi": "Tài liệu kỹ thuật là nền móng thực sự của ngành kỹ sư. Không có sơ đồ chuẩn thì việc bảo dưỡng chỉ là trò đoán mò may rủi.",
        "choices": []
    },
    {
        "id": "kaede_book_04",
        "category": "player_holding_book",
        "en": "Look at the cross-section diagrams in that manual! Clean isometric line art speaks louder than ten thousand words.",
        "vi": "Nhìn những sơ đồ mặt cắt trong cuốn sổ đó xem! Hình vẽ trục đo đẳng cự rõ ràng còn giá trị hơn vạn lời nói suông.",
        "choices": []
    },
    {
        "id": "kaede_book_05",
        "category": "player_holding_book",
        "en": "Studying structural carpentry formulas? Check the load-bearing calculations for the arched bridge—pure math in action.",
        "vi": "Đang nghiên cứu công thức mộc kết cấu à? Xem mấy bài tính tải trọng của cầu vòm gỗ đi—toán học thực chiến đỉnh cao luôn.",
        "choices": []
    },
    {
        "id": "kaede_book_06",
        "category": "player_holding_book",
        "en": "A developer who reads the manuals is a developer who solves issues in five minutes instead of five days.",
        "vi": "Lập trình viên chịu đọc kỹ hướng dẫn sử dụng là người giải quyết sự cố trong năm phút thay vì mò mẫm năm ngày trời.",
        "choices": []
    },
    {
        "id": "kaede_book_07",
        "category": "player_holding_book",
        "en": "Keep that reference book handy. When complex systems fail in production, cold printed truth is your best beacon.",
        "vi": "Giữ cuốn sổ tham khảo đó bên mình nhé. Khi hệ thống phức tạp gặp sự cố thực tế, sự thật in trên giấy chính là ngọn hải đăng sáng nhất.",
        "choices": []
    },
    {
        "id": "kaede_book_08",
        "category": "player_holding_book",
        "en": "Good reading, commander! Master the schematics and there isn't a machine in this world you can't overhaul.",
        "vi": "Đọc kỹ đấy chỉ huy! Nắm vững sơ đồ rồi thì chẳng có cỗ máy nào trên đời này mà cậu không đại tu được cả.",
        "choices": []
    },
    {
        "id": "kaede_drink_01",
        "category": "player_drinking",
        "en": "Gulping down that cold beverage! Ah, watching you hydrate makes me want to crack open a cold brew matcha myself!",
        "vi": "Uống ừng ực lon nước lạnh ngon lành ghê! Nhìn cậu uống làm tớ cũng muốn khui ngay một lon matcha lạnh ra uống cùng quá!",
        "choices": []
    },
    {
        "id": "kaede_drink_02",
        "category": "player_drinking",
        "en": "The procedural drinking animation executed cleanly. Grip held firm, can tilted smoothly to mouth level, zero camera glitch!",
        "vi": "Hoạt ảnh uống nước thực thi chuẩn xác ghê. Tay cầm chắc chắn, lon nghiêng mượt mà chạm miệng, góc máy không hề bị giật!",
        "choices": []
    },
    {
        "id": "kaede_drink_03",
        "category": "player_drinking",
        "en": "Drink deep, commander! Liquid replenishment keeps biological processor cores running cool under heavy computational workloads.",
        "vi": "Uống đã đời đi chỉ huy! Tiếp nước đầy đủ giúp các nhân xử lý sinh học luôn mát mẻ dưới tải trọng tính toán nặng nề.",
        "choices": []
    },
    {
        "id": "kaede_drink_04",
        "category": "player_drinking",
        "en": "That had to hit the spot! Nothing beats a cold canned drink after hiking across our 3D terrain.",
        "vi": "Đã khát thật đấy! Không gì sướng bằng một lon nước ướp lạnh sau khi lội bộ qua địa hình 3D của chúng ta.",
        "choices": []
    },
    {
        "id": "kaede_drink_05",
        "category": "player_drinking",
        "en": "Wiped your chin with the back of your glove? Haha, proper field-engineer style! Don't let Sakura catch you doing that!",
        "vi": "Lấy mu găng tay quẹt cằm à? Haha, đúng chuẩn tác phong kỹ sư thực địa! Đừng để Sakura bắt quả tang kẻo lại bị cằn nhằn đấy!",
        "choices": []
    },
    {
        "id": "kaede_drink_06",
        "category": "player_drinking",
        "en": "Finished the sip? You look ready to rebuild a combustion engine with your bare hands. Love the energy!",
        "vi": "Uống xong rồi chứ? Trông cậu sung sức như sẵn sàng đại tu cả cái động cơ đốt trong bằng tay không vậy. Mê cái năng lượng này ghê!",
        "choices": []
    },
    {
        "id": "kaede_drink_07",
        "category": "player_drinking",
        "en": "Hydration complete. Coolant fluid levels restored to 100%. Ready for the next high-stress task!",
        "vi": "Nạp nước hoàn tất. Mức dung dịch làm mát đã phục hồi 100%. Sẵn sàng cho nhiệm vụ áp lực cao tiếp theo rồi!",
        "choices": []
    },
    {
        "id": "kaede_drink_08",
        "category": "player_drinking",
        "en": "Remember to crush the can when done. Good recycling habits keep our workshop supplied with pure metal scrap.",
        "vi": "Uống xong nhớ bóp bẹp vỏ lon nhé. Thói quen tái chế tốt giúp xưởng cơ khí của chúng ta luôn có sẵn phế liệu kim loại sạch.",
        "choices": []
    },
    {
        "id": "kaede_terminal_01",
        "category": "player_using_terminal",
        "en": "Terminal mode engaged! Our Windows ConPTY bridge is humming silently in the background, forwarding I/O with zero friction.",
        "vi": "Đã vào chế độ Terminal! Cầu nối ConPTY trên Windows đang chạy êm ru dưới nền, chuyển tiếp dữ liệu I/O không chút ma sát.",
        "choices": []
    },
    {
        "id": "kaede_terminal_02",
        "category": "player_using_terminal",
        "en": "Look at that command line output streaming past! Pure raw computing power routed straight to your display.",
        "vi": "Nhìn dòng lệnh tuôn trào mượt mà kia xem! Sức mạnh tính toán nguyên bản truyền thẳng về màn hình của cậu.",
        "choices": []
    },
    {
        "id": "kaede_terminal_03",
        "category": "player_using_terminal",
        "en": "Running heavy compilation batches? Let 'em rip! The cooling fans on your host PC have plenty of headroom.",
        "vi": "Đang chạy biên dịch nặng à? Cứ cho chạy tẹt ga đi! Quạt tản nhiệt trên máy chủ ở nhà của cậu còn thừa nhiều công suất lắm.",
        "choices": []
    },
    {
        "id": "kaede_terminal_04",
        "category": "player_using_terminal",
        "en": "I tweaked the terminal font kerning and line-height so you won't get eye strain during marathon coding marathons.",
        "vi": "Tớ đã căn chỉnh khoảng cách chữ và chiều cao dòng trên terminal rồi, đảm bảo không bị mỏi mắt khi cày cuốc thâu đêm.",
        "choices": []
    },
    {
        "id": "kaede_terminal_05",
        "category": "player_using_terminal",
        "en": "Focus mode puts the terminal center-stage while parking the 3D rendering loop at reduced draw overhead. Smart power savings!",
        "vi": "Chế độ Focus đưa terminal lên trước và giảm tải vòng lặp dựng hình 3D lại. Tiết kiệm điện năng cực kỳ thông minh luôn!",
        "choices": []
    },
    {
        "id": "kaede_terminal_06",
        "category": "player_using_terminal",
        "en": "Command line power is unmatched. GUIs are pretty, but terminal shells are where real system surgeons operate.",
        "vi": "Sức mạnh dòng lệnh là vô đối. Giao diện đồ họa thì đẹp mắt đấy, nhưng terminal mới là nơi các bác sĩ phẫu thuật hệ thống thực thụ trổ tài.",
        "choices": []
    },
    {
        "id": "kaede_terminal_07",
        "category": "player_using_terminal",
        "en": "Need to capture remote desktop snapshots while in terminal? The tools drawer has automated screenshot utilities ready.",
        "vi": "Cần chụp ảnh màn hình máy tính từ xa khi đang ở terminal à? Ngăn kéo công cụ có sẵn tiện ích chụp ảnh tự động đấy.",
        "choices": []
    },
    {
        "id": "kaede_terminal_08",
        "category": "player_using_terminal",
        "en": "May your exit codes always return zero! Ship those features and make the whole infrastructure proud.",
        "vi": "Chúc mã thoát của cậu luôn là số 0 tròn trĩnh! Hãy tung các tính năng mới ra và làm cả hệ thống phải tự hào.",
        "choices": []
    },
    {
        "id": "kaede_chat_01",
        "category": "player_chatting",
        "en": "Firing off messages in MMO chat! The websocket broadcast service is routing packets across the cluster with zero latency.",
        "vi": "Đang bắn tin nhắn ầm ầm trên kênh chat MMO à! Dịch vụ truyền phát websocket đang định tuyến các gói tin qua cụm server với độ trễ bằng 0.",
        "choices": []
    },
    {
        "id": "kaede_chat_02",
        "category": "player_chatting",
        "en": "Sending a private whisper? Use `/m <player>` or hit the reply button directly. Clean, reliable communication pipelines.",
        "vi": "Đang gửi mật thư riêng tư à? Dùng lệnh `/m <tên>` hoặc bấm thẳng vào nút Reply nhé. Đường ống liên lạc gọn gàng và chuẩn xác.",
        "choices": []
    },
    {
        "id": "kaede_chat_03",
        "category": "player_chatting",
        "en": "Look at that 3D chat bubble hovering over your head! The billboarding matrix always keeps it facing the active camera.",
        "vi": "Nhìn bong bóng chat 3D lơ lửng trên đầu cậu kìa! Ma trận billboarding luôn giữ cho nó xoay thẳng về phía camera quan sát.",
        "choices": []
    },
    {
        "id": "kaede_chat_04",
        "category": "player_chatting",
        "en": "If you ever mistype a whisper recipient, hit Escape or tap the banner cancel button to reset the target. Easy fix.",
        "vi": "Nếu có gõ nhầm người nhận mật thư, cứ bấm phím Escape hoặc nút hủy trên dải băng để đặt lại mục tiêu nhé. Quá tiện luôn.",
        "choices": []
    },
    {
        "id": "kaede_chat_05",
        "category": "player_chatting",
        "en": "Coordinating deployments in global chat? Clear communication prevents accidental production collisions!",
        "vi": "Đang phối hợp triển khai trên chat chung à? Giao tiếp rõ ràng sẽ ngăn chặn những vụ đụng độ code thảm họa trên production đấy!",
        "choices": []
    },
    {
        "id": "kaede_chat_06",
        "category": "player_chatting",
        "en": "The chat system uses optimistic UI rendering: your message shows instantly while the server confirms in the background.",
        "vi": "Hệ thống chat dùng cơ chế hiển thị lạc quan (optimistic UI): tin nhắn hiện lên ngay lập tức trong khi server xác thực ngầm bên dưới.",
        "choices": []
    },
    {
        "id": "kaede_chat_07",
        "category": "player_chatting",
        "en": "Chatting with other devs makes this virtual world feel alive. Multiplayer synergy is what turns code into a community.",
        "vi": "Trò chuyện cùng các dev khác làm thế giới ảo này sống động hẳn lên. Sức mạnh nhiều người chơi biến mã nguồn thành một cộng đồng thực thụ.",
        "choices": []
    },
    {
        "id": "kaede_chat_08",
        "category": "player_chatting",
        "en": "Dispatch complete! Close the chat drawer when you're ready to resume exploring our open countryside.",
        "vi": "Gửi tin nhắn xong xuôi rồi chứ! Đóng khung chat lại khi cậu sẵn sàng tiếp tục khám phá vùng quê của chúng ta nhé.",
        "choices": []
    },
    {
        "id": "kaede_hub_01",
        "category": "location_hub",
        "en": "The central hub plaza! I poured reinforced concrete sub-bases under these granite slabs so they never crack under load.",
        "vi": "Quảng trường trung tâm! Tớ đã đổ móng bê tông cốt thép dưới mấy phiến đá hoa cương này nên không bao giờ sợ nứt dưới tải trọng nặng.",
        "choices": []
    },
    {
        "id": "kaede_hub_02",
        "category": "location_hub",
        "en": "This is the main interchange of our world. Heavy power conduits and fiber trunks all converge beneath this circular deck.",
        "vi": "Đây là nút giao thông chính của thế giới chúng ta. Các đường cáp điện nặng và trục cáp quang đều hội tụ dưới sàn tròn này.",
        "choices": []
    },
    {
        "id": "kaede_hub_03",
        "category": "location_hub",
        "en": "Notice the perimeter drainage slots along the plaza edge; even during torrential typhoons, zero standing water pools here.",
        "vi": "Để ý mấy rãnh thoát nước xung quanh mép quảng trường xem; ngay cả trong bão lớn cũng không bao giờ có vũng nước đọng ở đây.",
        "choices": []
    },
    {
        "id": "kaede_hub_04",
        "category": "location_hub",
        "en": "The spawn point coordinates are calibrated to exact spatial precision. Smooth spawn, no collision clipping.",
        "vi": "Tọa độ điểm hồi sinh được hiệu chỉnh với độ chính xác không gian tuyệt đối. Xuất hiện mượt mà, không bị kẹt va chạm.",
        "choices": []
    },
    {
        "id": "kaede_hub_05",
        "category": "location_hub",
        "en": "From here, you have clear sightlines to the bridge, the cherry grove, and the village. Clean spatial planning!",
        "vi": "Từ đây cậu có tầm nhìn thoáng đãng tới cây cầu, đồi hoa anh đào và ngôi làng. Quy hoạch không gian chuẩn chỉ ghê!",
        "choices": []
    },
    {
        "id": "kaede_hub_06",
        "category": "location_hub",
        "en": "The lighting fixtures embedded in the hub rim run on low-voltage DC currents. Energy-efficient and ruggedly built.",
        "vi": "Dàn đèn âm viền quanh quảng trường chạy bằng nguồn điện một chiều DC điện áp thấp. Tiết kiệm điện và siêu bền bỉ.",
        "choices": []
    },
    {
        "id": "kaede_hub_07",
        "category": "location_hub",
        "en": "Whenever you get turned around in the wilderness, head toward the plaza beacon. You can't miss it.",
        "vi": "Bất cứ khi nào bị mất phương hướng ngoài đồng hoang, cứ nhắm hướng ngọn hải đăng quảng trường mà đi. Không thể lạc được đâu.",
        "choices": []
    },
    {
        "id": "kaede_hub_08",
        "category": "location_hub",
        "en": "Welcome to ground zero of our operations. Stand firm on this solid foundation, commander!",
        "vi": "Chào mừng về với tổng hành dinh tác chiến. Đứng vững trên nền móng kiên cố này nhé chỉ huy!",
        "choices": []
    },
    {
        "id": "kaede_village_01",
        "category": "location_village",
        "en": "The rustic village square! I helped frame the timber rafters on those wooden houses. Authentic Japanese mortise joints!",
        "vi": "Quảng trường làng mộc mạc! Tớ đã phụ dựng xà gồ gỗ cho mấy nếp nhà kia đấy. Toàn mộng gỗ truyền thống chuẩn chỉ của Nhật!",
        "choices": []
    },
    {
        "id": "kaede_village_02",
        "category": "location_village",
        "en": "Did you check out the vintage bicycle parked by the fence? I tuned its coaster brakes and lubed the chain last Tuesday.",
        "vi": "Cậu đã nghía chiếc xe đạp cổ dựng cạnh hàng rào chưa? Thứ ba tuần trước tớ vừa cân lại phanh và tra dầu xích cho nó đấy.",
        "choices": []
    },
    {
        "id": "kaede_village_03",
        "category": "location_village",
        "en": "Ring the bicycle bell if you want to test the sound engine! It has authentic brass acoustic resonance.",
        "vi": "Rung chuông xe đạp xem nào nếu muốn thử âm thanh! Nó có tiếng chuông đồng vang ngân cực kỳ chân thực đấy.",
        "choices": []
    },
    {
        "id": "kaede_village_04",
        "category": "location_village",
        "en": "The roadside rest stop bench is where the village elders gather to discuss crop rotations and mechanical repairs.",
        "vi": "Chiếc ghế ở trạm dừng chân ven đường là nơi các cụ trong làng hay ngồi bàn chuyện mùa màng và sửa chữa máy nông nghiệp.",
        "choices": []
    },
    {
        "id": "kaede_village_05",
        "category": "location_village",
        "en": "Notice the stone water troughs in the alleys; gravity feeds water continuously from the mountain flume.",
        "vi": "Để ý mấy máng nước bằng đá trong ngõ xem; nước từ máng núi chảy tự nhiên về đây bằng trọng lực liên tục đấy.",
        "choices": []
    },
    {
        "id": "kaede_village_06",
        "category": "location_village",
        "en": "The timber buildings have cedar eaves angled to deflect snow in winter and shed monsoon rain in summer.",
        "vi": "Những ngôi nhà gỗ có mái hiên tuyết tùng nghiêng vừa đủ để gạt tuyết mùa đông và thoát nước mưa rào mùa hè.",
        "choices": []
    },
    {
        "id": "kaede_village_07",
        "category": "location_village",
        "en": "Village life is peaceful, but beneath the quiet surface, our automated backup scripts run on rigorous cron timers.",
        "vi": "Cuộc sống làng quê thanh bình thật, nhưng dưới vẻ tĩnh lặng ấy, các script sao lưu tự động vẫn chạy chuẩn theo lịch cron nghiêm ngặt.",
        "choices": []
    },
    {
        "id": "kaede_village_08",
        "category": "location_village",
        "en": "Take a stroll through the village lanes. It's a great reminder that technology exists to serve human peace of mind.",
        "vi": "Dạo một vòng qua những con ngõ trong làng đi. Đó là lời nhắc nhở tuyệt vời rằng công nghệ tồn tại là để phục vụ sự an tâm của con người.",
        "choices": []
    },
    {
        "id": "kaede_rice_01",
        "category": "location_rice_field",
        "en": "The stepped rice terraces! That terraced layout is basically a multi-stage gravity-fed hydraulic cooling matrix!",
        "vi": "Những thửa ruộng bậc thang! Bố cục giật cấp đó về cơ bản là một ma trận tản nhiệt thủy lực phân tầng chảy bằng trọng lực đấy!",
        "choices": []
    },
    {
        "id": "kaede_rice_02",
        "category": "location_rice_field",
        "en": "The earthen bunds separating the flooded plots are packed hard with clay. Firm footing, but watch out for wet spots!",
        "vi": "Những bờ ruộng đất ngăn giữa các ô nước được đầm chặt bằng đất sét. Chân bước vững đấy, nhưng nhớ tránh mấy chỗ bùn nhão nhé!",
        "choices": []
    },
    {
        "id": "kaede_rice_03",
        "category": "location_rice_field",
        "en": "Each step drops about 0.8 meters. The water sluice gates allow farmers to tune the flow rates with wooden pegs.",
        "vi": "Mỗi bậc ruộng chênh nhau khoảng 0.8 mét. Các cửa phai cống cho phép bà con điều chỉnh lưu lượng nước bằng chốt gỗ.",
        "choices": []
    },
    {
        "id": "kaede_rice_04",
        "category": "location_rice_field",
        "en": "The flooded water reflects the clouds like a multi-monitor mirror setup. Nature's own wide-aspect display!",
        "vi": "Mặt nước ngập phản chiếu mây trời hệt như một dàn màn hình gương ghép đa màn hình. Màn hình góc rộng tự nhiên của tạo hóa!",
        "choices": []
    },
    {
        "id": "kaede_rice_05",
        "category": "location_rice_field",
        "en": "Don't go dropping heavy toolkits into the mud! Digging up dropped wrenches from wet clay is no picnic, trust me.",
        "vi": "Đừng có làm rơi hộp đồ nghề nặng xuống bùn đấy nhé! Mò cờ-lê dưới bùn lầy không vui vẻ gì đâu, tin tớ đi.",
        "choices": []
    },
    {
        "id": "kaede_rice_06",
        "category": "location_rice_field",
        "en": "The rich organic soil here produces top-grade short-grain rice. Best staple food for fueling long coding marathons.",
        "vi": "Đất phù sa màu mỡ nơi đây cho ra loại gạo hạt tròn hảo hạng. Lương thực tuyệt nhất để tiếp sức cho những cuộc cày code kéo dài.",
        "choices": []
    },
    {
        "id": "kaede_rice_07",
        "category": "location_rice_field",
        "en": "Listen to the water gurgling through the bamboo flumes. Passive engineering that requires zero kilowatt-hours to operate.",
        "vi": "Lắng nghe tiếng nước róc rách qua các máng tre xem. Kỹ thuật thụ động thông minh không tốn lấy một kilowatt điện nào để vận hành.",
        "choices": []
    },
    {
        "id": "kaede_rice_08",
        "category": "location_rice_field",
        "en": "The terraces stretch all the way down to the river valley. Remarkable civil engineering by the local settlers.",
        "vi": "Những thửa ruộng bậc thang trải dài xuống tận thung lũng ven sông. Công trình thủy lợi đáng kinh ngạc của người dân địa phương.",
        "choices": []
    },
    {
        "id": "kaede_river_01",
        "category": "location_river",
        "en": "The meandering river! That water flow is the ultimate natural liquid-cooling loop for the whole valley ecosystem.",
        "vi": "Dòng sông uốn lượn! Dòng chảy đó chính là vòng tản nhiệt nước tự nhiên đỉnh cao cho toàn bộ hệ sinh thái thung lũng này.",
        "choices": []
    },
    {
        "id": "kaede_river_02",
        "category": "location_river",
        "en": "Stay out of the deep river channel! Our pathfinding system is hardcoded to prevent NPCs from wading into the water.",
        "vi": "Đừng có lội xuống lòng sông sâu nhé! Hệ thống tìm đường của chúng ta được lập trình nghiêm ngặt cấm NPC lội bừa xuống nước đấy.",
        "choices": []
    },
    {
        "id": "kaede_river_03",
        "category": "location_river",
        "en": "Look at the riverside campfire site: dry kindling, river stone fire ring, and a steady supply of firewood.",
        "vi": "Nhìn khu lửa trại bên bờ sông xem: bùi nhùi khô, vòng đá cuội chắn lửa và đống củi khô được xếp gọn gàng.",
        "choices": []
    },
    {
        "id": "kaede_river_04",
        "category": "location_river",
        "en": "The riverbed stones are rounded and smooth from centuries of hydrodynamic friction. Nature is a patient machinist.",
        "vi": "Đá dưới lòng sông tròn nhẵn thín sau hàng thế kỷ bị ma sát thủy động lực học mài giũa. Tự nhiên chính là một thợ tiện kiên nhẫn nhất.",
        "choices": []
    },
    {
        "id": "kaede_river_05",
        "category": "location_river",
        "en": "There's a solid cedar bench right here by the river bank. Pull up a seat and let the water sounds wash away your fatigue.",
        "vi": "Có chiếc ghế tuyết tùng vững chãi ngay đây bên bờ sông này. Ngồi xuống đi và để tiếng nước cuốn trôi mọi mỏi mệt trong người.",
        "choices": []
    },
    {
        "id": "kaede_river_06",
        "category": "location_river",
        "en": "The water surface shader uses real-time normal maps and Fresnel reflection math. Looks crystal clear and physically based!",
        "vi": "Bộ shader mặt nước dùng bản đồ pháp tuyến (normal map) thời gian thực và công thức phản xạ Fresnel. Nhìn trong vắt chuẩn PBR!",
        "choices": []
    },
    {
        "id": "kaede_river_07",
        "category": "location_river",
        "en": "The river flow follows a mathematical sin curve across the world grid. Smooth sinusoidal meandering at its best.",
        "vi": "Dòng sông uốn khúc theo đường cong sin toán học trên lưới bản đồ. Dòng chảy lượn sóng mềm mại không tì vết.",
        "choices": []
    },
    {
        "id": "kaede_river_08",
        "category": "location_river",
        "en": "If you follow the river current downstream, it heads straight toward the southern coast and the fishing pier.",
        "vi": "Cứ đi xuôi theo dòng chảy của con sông này là nó sẽ dẫn thẳng ra bờ biển phía nam và cây cầu tàu đánh cá đấy.",
        "choices": []
    },
    {
        "id": "kaede_bridge_01",
        "category": "location_bridge",
        "en": "The arched timber bridge! My proudest structural masterpiece! Parabolic arch, laminated cedar beams, zero metal screws in the arch!",
        "vi": "Cây cầu vòm gỗ! Kiệt tác kết cấu mà tớ tự hào nhất! Vòm cong parabol, dầm tuyết tùng ghép lớp, không dùng một con ốc kim loại nào trong vòm!",
        "choices": []
    },
    {
        "id": "kaede_bridge_02",
        "category": "location_bridge",
        "en": "Notice how the deck height curves up to peak at `py = sin(t * PI) * 0.68 + 0.24`. Perfect parabolic elevation math!",
        "vi": "Để ý độ cao mặt cầu vồng lên đạt đỉnh ở công thức `py = sin(t * PI) * 0.68 + 0.24` xem. Toán học độ cao parabol chuẩn từng ly!",
        "choices": []
    },
    {
        "id": "kaede_bridge_03",
        "category": "location_bridge",
        "en": "All bridge abutments are anchored into solid bedrock on both shores. This baby can withstand category 5 earthquakes.",
        "vi": "Mọi mố cầu đều được ngàm chặt vào nền đá mẹ ở cả hai bờ. Công trình này chịu được cả động đất cấp 5 luôn đấy.",
        "choices": []
    },
    {
        "id": "kaede_bridge_04",
        "category": "location_bridge",
        "en": "Stand on the bridge crest and look down at the river rapids! You get an unobstructed view of both north and south banks.",
        "vi": "Đứng trên đỉnh vòm cầu nhìn xuống dòng nước xiết xem! Cậu có tầm nhìn thoáng đãng bao quát cả hai bờ bắc và nam luôn.",
        "choices": []
    },
    {
        "id": "kaede_bridge_05",
        "category": "location_bridge",
        "en": "All NPC navigation paths across the river are routed across this bridge deck. Clean waypoints, no river wading bugs.",
        "vi": "Mọi đường đi của NPC qua sông đều được định tuyến đi qua mặt cầu này. Các điểm nút rõ ràng, không bao giờ có lỗi lội nước ngớ ngẩn.",
        "choices": []
    },
    {
        "id": "kaede_bridge_06",
        "category": "location_bridge",
        "en": "I hand-planed the cedar handrails so travelers could lean against them comfortably without scratching their palms.",
        "vi": "Tớ đã đích thân bào nhẵn tay vịn tuyết tùng để người đi đường có thể tựa vào thoải mái mà không bị xước tay.",
        "choices": []
    },
    {
        "id": "kaede_bridge_07",
        "category": "location_bridge",
        "en": "Listen to the solid thud under your boots as you cross. That's the sound of heavy timber handling your weight with ease.",
        "vi": "Nghe tiếng bước chân nện chắc nịch dưới đế giày khi băng qua cầu không. Đó là âm thanh của gỗ khối chịu lực dễ dàng nâng bước cậu đấy.",
        "choices": []
    },
    {
        "id": "kaede_bridge_08",
        "category": "location_bridge",
        "en": "Connecting two isolated shores with a single elegant timber arch... That's why I became an engineer in the first place.",
        "vi": "Nối liền hai bờ cách trở bằng một nhịp cầu gỗ thanh nhã duy nhất... Đó chính là lý do đầu tiên thôi thúc tớ trở thành kỹ sư đấy.",
        "choices": []
    },
    {
        "id": "kaede_cherry_01",
        "category": "location_cherry_grove",
        "en": "The cherry blossom hill! Petals are fluttering everywhere! Make sure they don't clog up your cooling fan grilles!",
        "vi": "Đồi hoa anh đào! Cánh hoa bay rợp trời kìa! Cẩn thận đừng để cánh hoa lọt vào làm kẹt lưới quạt tản nhiệt của cậu nhé!",
        "choices": []
    },
    {
        "id": "kaede_cherry_02",
        "category": "location_cherry_grove",
        "en": "Sakura takes care of this grove like a protective lioness. Don't you dare break any branches while testing your sword swings!",
        "vi": "Sakura chăm chút cho vườn hoa này như sư tử bảo vệ con vậy. Cấm cậu vung kiếm thử mà làm gãy cành cây nào đấy nhé!",
        "choices": []
    },
    {
        "id": "kaede_cherry_03",
        "category": "location_cherry_grove",
        "en": "The bench under the big sakura tree has an awesome panoramic angle over the river valley. Great spot for lunch breaks.",
        "vi": "Chiếc ghế dưới gốc anh đào to có góc ngắm toàn cảnh thung lũng sông tuyệt đẹp. Nơi lý tưởng để ngồi ăn trưa nghỉ ngơi.",
        "choices": []
    },
    {
        "id": "kaede_cherry_04",
        "category": "location_cherry_grove",
        "en": "I engineered the soil retaining wall on this hill so rainfall runoff doesn't cause mudslides onto the road below.",
        "vi": "Tớ đã thiết kế kè đá giữ đất trên sườn đồi này để nước mưa không làm xói mòn sạt lở xuống con đường bên dưới đấy.",
        "choices": []
    },
    {
        "id": "kaede_cherry_05",
        "category": "location_cherry_grove",
        "en": "The pink blossom color contrasts nicely against my emerald green work jacket. Even a mechanic appreciates good color matching.",
        "vi": "Sắc hoa hồng phấn tương phản rất đẹp với áo khoác thợ màu xanh ngọc lục bảo của tớ. Thợ cơ khí cũng biết phối màu thẩm mỹ phết đấy chứ.",
        "choices": []
    },
    {
        "id": "kaede_cherry_06",
        "category": "location_cherry_grove",
        "en": "The spring breeze blowing through these trees creates natural pink confetti. Pure anime movie magic in real 3D!",
        "vi": "Gió xuân thổi qua rặng cây tạo nên cơn mưa pháo hoa màu hồng tự nhiên. Phép thuật phim anime đích thực trên nền 3D sống động!",
        "choices": []
    },
    {
        "id": "kaede_cherry_07",
        "category": "location_cherry_grove",
        "en": "Take a seat on the bench and rest your boots. You've been on the move all afternoon.",
        "vi": "Ngồi xuống chiếc ghế nghỉ chân đi. Cậu đã đi lại lặn lội suốt cả buổi chiều rồi đấy.",
        "choices": []
    },
    {
        "id": "kaede_cherry_08",
        "category": "location_cherry_grove",
        "en": "Blossoms bloom and fade every spring, but good structural code lasts for decades. Keep building strong, commander!",
        "vi": "Hoa nở rồi tàn mỗi độ xuân về, nhưng mã nguồn kết cấu tốt sẽ trường tồn hàng thập kỷ. Hãy luôn xây dựng vững chắc nhé chỉ huy!",
        "choices": []
    },
    {
        "id": "kaede_mountain_01",
        "category": "location_mountain",
        "en": "The alpine mountain ridge! Up here at high altitude, atmospheric pressure drops and air cooling efficiency shifts!",
        "vi": "Rặng núi cao tuyết phủ! Lên tới độ cao này, áp suất khí quyển giảm đi và hiệu suất tản nhiệt không khí thay đổi rõ rệt luôn!",
        "choices": []
    },
    {
        "id": "kaede_mountain_02",
        "category": "location_mountain",
        "en": "Look at those snow-capped peaks in the background! Multi-layered distant terrain with atmospheric depth fog. Crisp rendering!",
        "vi": "Nhìn những đỉnh núi tuyết phía sau kìa! Địa hình xa đa tầng kết hợp sương mù chiều sâu khí quyển. Dựng hình nét căng!",
        "choices": []
    },
    {
        "id": "kaede_mountain_03",
        "category": "location_mountain",
        "en": "The wind up on this ridge is intense! I had to bolt that panorama bench down with four heavy steel anchor rods.",
        "vi": "Gió trên triền núi này thổi rát thật! Tớ đã phải bắt chết chiếc ghế ngắm cảnh đó xuống đá bằng bốn thanh neo thép dày cộp đấy.",
        "choices": []
    },
    {
        "id": "kaede_mountain_04",
        "category": "location_mountain",
        "en": "From this vantage point, you can inspect the layout of every single subsystem across the entire island.",
        "vi": "Từ điểm quan sát này, cậu có thể bao quát toàn bộ bố cục của từng phân hệ trên khắp hòn đảo.",
        "choices": []
    },
    {
        "id": "kaede_mountain_05",
        "category": "location_mountain",
        "en": "The air is crisp, dry, and clean. No dust, no smog—ideal conditions for testing optical transmission sensors.",
        "vi": "Không khí se lạnh, khô ráo và sạch bong. Không bụi bặm, không khói mờ—điều kiện lý tưởng để thử nghiệm cảm biến quang học.",
        "choices": []
    },
    {
        "id": "kaede_mountain_06",
        "category": "location_mountain",
        "en": "Sit upon the hilltop panorama bench and look out at the world. You climbed all the way up here; savor the summit!",
        "vi": "Ngồi lên chiếc ghế ngắm toàn cảnh đỉnh đồi mà phóng mắt ngắm thế giới đi. Cậu đã leo một mạch lên tận đây; hãy tận hưởng đỉnh cao!",
        "choices": []
    },
    {
        "id": "kaede_mountain_07",
        "category": "location_mountain",
        "en": "The granite bedrock up here is billions of years old. Mother Nature's ultimate stress-tested material.",
        "vi": "Nền đá hoa cương trên này đã hàng tỷ năm tuổi rồi. Vật liệu chịu lực đỉnh cao đã qua bài test khắc nghiệt nhất của Mẹ Thiên Nhiên.",
        "choices": []
    },
    {
        "id": "kaede_mountain_08",
        "category": "location_mountain",
        "en": "Standing on the crest beside you feels awesome, commander! High altitude and high ambitions go hand in hand.",
        "vi": "Đứng trên đỉnh núi cạnh cậu cảm giác đã thật đấy, chỉ huy! Tầm cao của ngọn núi và tầm nhìn của hoài bão luôn đồng hành cùng nhau.",
        "choices": []
    },
    {
        "id": "kaede_beach_01",
        "category": "location_beach",
        "en": "The sandy coastal beach! Watch out for salt spray on your metal gear—marine corrosion is an engineer's worst enemy!",
        "vi": "Bãi biển cát duyên hải! Coi chừng bụi muối biển bám vào đồ kim loại nhé—ăn mòn nước mặn là kẻ thù số một của dân cơ khí đấy!",
        "choices": []
    },
    {
        "id": "kaede_beach_02",
        "category": "location_beach",
        "en": "The fine sand shifts beneath your boots. It's basically silica crystals ground down by millions of ocean wave cycles.",
        "vi": "Cát mịn lún dưới đế giày. Nó chính là các tinh thể silica bị nghiền nhỏ sau hàng triệu chu kỳ sóng biển đập vào đấy.",
        "choices": []
    },
    {
        "id": "kaede_beach_03",
        "category": "location_beach",
        "en": "There's a shaded bench right under that beach umbrella. Sit down and let the sea breeze cool your radiators.",
        "vi": "Có chiếc ghế râm mát ngay dưới cây dù bãi biển kia. Ngồi xuống đi và để gió biển làm mát các phiến tản nhiệt của cậu.",
        "choices": []
    },
    {
        "id": "kaede_beach_04",
        "category": "location_beach",
        "en": "Listen to the rhythmic roar of the incoming surf. Nature's own low-frequency subwoofer operating around 30 Hertz.",
        "vi": "Lắng nghe tiếng sóng vỗ rì rào theo nhịp điệu. Loa siêu trầm tần số thấp tự nhiên của tạo hóa đang đánh ở khoảng 30 Hertz đấy.",
        "choices": []
    },
    {
        "id": "kaede_beach_05",
        "category": "location_beach",
        "en": "The water surface meets the sand with a smooth wave foam shader. Zero harsh rendering seam along the tide line.",
        "vi": "Mặt nước tiếp giáp với bờ cát bằng bộ shader bọt sóng mượt mà. Không hề có vết cắt răng cưa thô thiển nào dọc mép nước.",
        "choices": []
    },
    {
        "id": "kaede_beach_06",
        "category": "location_beach",
        "en": "I coated the umbrella frame with marine-grade anti-rust primer. That brass pole won't corrode for at least twenty years!",
        "vi": "Tớ đã sơn lót chống gỉ hàng hải cho khung dù rồi. Cái cán đồng thau đó sẽ không bị gỉ sét trong ít nhất hai mươi năm tới!",
        "choices": []
    },
    {
        "id": "kaede_beach_07",
        "category": "location_beach",
        "en": "The open horizon stretches endlessly toward the south. Makes you want to build a motorized catamaran and go exploring!",
        "vi": "Đường chân trời mở rộng bao la về phía nam. Nhìn chỉ muốn đóng ngay một chiếc ca-nô hai thân gắn máy để phi ra khơi khám phá!",
        "choices": []
    },
    {
        "id": "kaede_beach_08",
        "category": "location_beach",
        "en": "Kick back and relax on the sand, commander. Even the toughest field engineers need beach time to recharge.",
        "vi": "Tựa lưng thư giãn trên bãi cát đi chỉ huy. Đến cả những kỹ sư thực địa rắn rỏi nhất cũng cần thời gian đi biển để sạc lại năng lượng.",
        "choices": []
    },
    {
        "id": "kaede_pier_01",
        "category": "location_pier",
        "en": "The rustic wooden fishing pier! Walk straight down the center planks—I reinforced every single supporting pile with treated timber!",
        "vi": "Cầu tàu đánh cá mộc mạc! Đi thẳng vào các tấm ván giữa nhé—tớ đã gia cố từng cọc trụ đỡ bằng gỗ ngâm tẩm hóa chất chống mục rồi!",
        "choices": []
    },
    {
        "id": "kaede_pier_02",
        "category": "location_pier",
        "en": "Notice the surface elevation: the pier walkway sits at a walkable height of 0.20 meters above the sea surface. Perfect clearance!",
        "vi": "Để ý độ cao mặt sàn xem: lối đi cầu tàu nằm ở độ cao đi bộ 0.20 mét trên mặt biển. Khoảng hở an toàn tuyệt đối luôn!",
        "choices": []
    },
    {
        "id": "kaede_pier_03",
        "category": "location_pier",
        "en": "Hear the wood creak under your boots? Our surface detector identifies `wood_pier` with authentic creaking audio params.",
        "vi": "Nghe tiếng gỗ cọt kẹt dưới chân không? Bộ nhận diện bề mặt ghi nhận chuẩn loại `wood_pier` với thông số âm thanh cọt kẹt chân thực.",
        "choices": []
    },
    {
        "id": "kaede_pier_04",
        "category": "location_pier",
        "en": "Out here at the pierhead, you're surrounded by water on three sides! Outstanding marine panorama.",
        "vi": "Ra tận đầu cầu tàu này, ba bề đều là nước biển ôm trọn! Cảnh quan hàng hải đỉnh cao không góc chết.",
        "choices": []
    },
    {
        "id": "kaede_pier_05",
        "category": "location_pier",
        "en": "The bench at the pierhead is anchored with marine brass brackets. Sit down and watch the tide roll in.",
        "vi": "Chiếc ghế ở đầu cầu tàu được bắt chặt bằng giá đỡ đồng thau chịu mặn. Ngồi xuống và ngắm từng đợt thủy triều dâng lên nào.",
        "choices": []
    },
    {
        "id": "kaede_pier_06",
        "category": "location_pier",
        "en": "The tide slapping against the pilings provides natural structural damping against wave sway. Robust marine carpentry!",
        "vi": "Từng đợt sóng vỗ vào cọc trụ tạo nên độ giảm chấn kết cấu tự nhiên chống rung lắc mặt sàn. Nghề mộc hàng hải vững chắc thật!",
        "choices": []
    },
    {
        "id": "kaede_pier_07",
        "category": "location_pier",
        "en": "Be careful not to drop any metal tools between the plank gaps! Diving in the deep ocean to retrieve a spanner is freezing cold!",
        "vi": "Cẩn thận đừng làm rơi dụng cụ kim loại lọt qua khe ván nhé! Lặn xuống biển sâu mò cờ-lê lạnh buốt thấu xương đấy!",
        "choices": []
    },
    {
        "id": "kaede_pier_08",
        "category": "location_pier",
        "en": "Look at the endless blue horizon. A sturdy wooden pier reaching into the ocean: human engineering greeting the wild sea.",
        "vi": "Nhìn chân trời xanh thẳm vô tận xem. Một cây cầu tàu gỗ kiên cố vươn mình ra biển: kỹ thuật con người chào đón đại dương bao la.",
        "choices": []
    },
    {
        "id": "kaede_rank_01",
        "category": "high_rank",
        "en": "Salute to the Master Architect! Commander, your high-level badge is shining like a freshly buffed titanium plate!",
        "vi": "Nghiêm mình chào Bậc Thầy Kiến Trúc! Chỉ huy ơi, huy hiệu cấp cao của cậu đang sáng lóa như tấm kim loại titan vừa được đánh bóng vậy!",
        "choices": []
    },
    {
        "id": "kaede_rank_02",
        "category": "high_rank",
        "en": "Grinding up to that rank takes serious engineering grit. You've proven you can handle the heaviest production workloads.",
        "vi": "Cày cuốc lên được cấp bậc đó đòi hỏi bản lĩnh kỹ sư lì lợm thực sự. Cậu đã chứng minh mình gánh được những dự án nặng nề nhất.",
        "choices": []
    },
    {
        "id": "kaede_rank_03",
        "category": "high_rank",
        "en": "Your overhead rank badge has a custom golden vector insignia! It marks you as a certified heavy-machinery commander.",
        "vi": "Huy hiệu cấp bậc trên đầu cậu có biểu tượng vector vàng kim đặc biệt! Đánh dấu cậu là người chỉ huy cơ giới hạng nặng được chứng nhận.",
        "choices": []
    },
    {
        "id": "kaede_rank_04",
        "category": "high_rank",
        "en": "With that high authority, you can green-light major infrastructural overhauls. Let's upgrade the whole server cluster!",
        "vi": "Với quyền hạn cấp cao đó, cậu có thể bật đèn xanh cho những đợt đại tu hạ tầng lớn. Nâng cấp toàn bộ cụm máy chủ thôi nào!",
        "choices": []
    },
    {
        "id": "kaede_rank_05",
        "category": "high_rank",
        "en": "Even with all that prestige, you still come hang out by the workshop. You're a real down-to-earth leader, commander.",
        "vi": "Dù ở vị thế lẫy lừng thế, cậu vẫn ghé qua xưởng cơ khí tán gẫu. Cậu đúng là một người thủ lĩnh thực tế và gần gũi, chỉ huy à.",
        "choices": []
    },
    {
        "id": "kaede_rank_06",
        "category": "high_rank",
        "en": "I'd trust your architectural judgment on any bridge or server configuration. You know your mechanics inside out.",
        "vi": "Tớ tin tưởng tuyệt đối vào phán đoán kiến trúc của cậu trên bất kỳ cây cầu hay cấu hình máy chủ nào. Cậu hiểu rõ từng ngóc ngách.",
        "choices": []
    },
    {
        "id": "kaede_rank_07",
        "category": "high_rank",
        "en": "Keep leading by example! When junior developers see a master who understands low-level hardware, they learn true craft.",
        "vi": "Hãy tiếp tục làm gương nhé! Khi các dev trẻ thấy một bậc thầy am hiểu tận tường phần cứng cấp thấp, họ sẽ học được tay nghề đích thực.",
        "choices": []
    },
    {
        "id": "kaede_rank_08",
        "category": "high_rank",
        "en": "To the high summit! Here's to zero downtime, infinite scalability, and flawless engineering execution under your watch!",
        "vi": "Hướng tới những đỉnh cao mới! Chúc cho hệ thống không bao giờ sập, mở rộng vô hạn và kỹ thuật hoàn hảo dưới sự dẫn dắt của cậu!",
        "choices": []
    },
    {
        "id": "kaede_level_01",
        "category": "low_level",
        "en": "Welcome aboard, rookie engineer! Don't sweat that Novice title; I started out stripping screw heads on lawnmower engines!",
        "vi": "Chào mừng gia nhập đội ngũ, tân binh kỹ sư! Đừng bận tâm danh hiệu Tập Sự; hồi mới vào nghề tớ cũng toàn làm toét đầu ốc động cơ máy cắt cỏ thôi!",
        "choices": []
    },
    {
        "id": "kaede_level_02",
        "category": "low_level",
        "en": "First rule of the workshop: if something doesn't work, don't force it with a bigger hammer! Inspect the schematics first.",
        "vi": "Quy tắc số một của xưởng máy: nếu thứ gì không chạy, đừng cố dùng búa to hơn để đập! Hãy kiểm tra lại sơ đồ bản vẽ trước đã.",
        "choices": []
    },
    {
        "id": "kaede_level_03",
        "category": "low_level",
        "en": "Every master was once an apprentice who made mistakes and learned how to fix 'em. Keep your chin up and keep tinkering!",
        "vi": "Mọi bậc thầy đều từng là người học việc mắc sai lầm rồi tự tay sửa chữa. Cứ tự tin ngẩng cao đầu và tiếp tục mày mò nhé!",
        "choices": []
    },
    {
        "id": "kaede_level_04",
        "category": "low_level",
        "en": "Your level will climb fast once you start submitting real pull requests. Experience points come from real mileage on the road.",
        "vi": "Cấp độ của cậu sẽ tăng vèo vèo một khi cậu bắt đầu gửi những pull request thực chiến. Điểm kinh nghiệm đến từ quãng đường thực tế cậu đã đi.",
        "choices": []
    },
    {
        "id": "kaede_level_05",
        "category": "low_level",
        "en": "Need any tools or tips on debugging? Come find me anytime. The workshop is always open for newcomers eager to learn.",
        "vi": "Cần dụng cụ hay mẹo gỡ lỗi gì thì cứ tìm tớ bất cứ lúc nào. Cửa xưởng luôn rộng mở chào đón những người mới ham học hỏi.",
        "choices": []
    },
    {
        "id": "kaede_level_06",
        "category": "low_level",
        "en": "Don't be afraid to take things apart to see how they work. Reverse-engineering is the fastest school of practical knowledge.",
        "vi": "Đừng sợ tháo tung mọi thứ ra để xem chúng hoạt động thế nào. Dịch ngược kỹ thuật (reverse-engineering) là trường học nhanh nhất về kiến thức thực tiễn.",
        "choices": []
    },
    {
        "id": "kaede_level_07",
        "category": "low_level",
        "en": "Wear that Lv.1 badge with pride! The best adventures start at the very beginning of the skill tree.",
        "vi": "Hãy đeo tấm huy hiệu Cấp 1 đó với niềm tự hào! Những chuyến phiêu lưu tuyệt nhất luôn bắt đầu từ điểm khởi đầu của cây kỹ năng.",
        "choices": []
    },
    {
        "id": "kaede_level_08",
        "category": "low_level",
        "en": "You've got the spark of a real builder in your eyes. Keep pushing, rookie, you're going to build great things!",
        "vi": "Tớ thấy ánh lửa của một người kiến tạo thực thụ trong mắt cậu. Cố lên nhé tân binh, cậu sẽ làm nên những điều vĩ đại!",
        "choices": []
    },
    {
        "id": "kaede_wind_01",
        "category": "wind_weather",
        "en": "Feel that spring gust? Testing structural wind loads on buildings is a standard engineering procedure!",
        "vi": "Cảm nhận cơn gió xuân giật chưa? Kiểm tra tải trọng gió trên các công trình là quy trình kỹ thuật tiêu chuẩn đấy!",
        "choices": []
    },
    {
        "id": "kaede_wind_02",
        "category": "wind_weather",
        "en": "The intermittent soft wind audio rebalancing sounds so crisp now. Master volume and ambiance sliders scale it smoothly.",
        "vi": "Cân bằng âm thanh gió nhẹ ngắt quãng nghe nét căng rồi. Các thanh trượt âm lượng tổng và môi trường điều chỉnh mượt mà lắm.",
        "choices": []
    },
    {
        "id": "kaede_wind_03",
        "category": "wind_weather",
        "en": "The wind is turning the village weather vane like crazy! High torque on the brass bearings today.",
        "vi": "Gió đang làm con gà quay chỉ hướng trên mái nhà quay tít mù kìa! Mô-men xoắn trên ổ bi đồng thau hôm nay cao phết.",
        "choices": []
    },
    {
        "id": "kaede_wind_04",
        "category": "wind_weather",
        "en": "A good breeze cools down outdoor electronic enclosures naturally. Free passive convective heat dissipation!",
        "vi": "Một làn gió mát mẻ giúp hạ nhiệt các tủ điện ngoài trời một cách tự nhiên. Giải nhiệt đối lưu thụ động miễn phí luôn!",
        "choices": []
    },
    {
        "id": "kaede_wind_05",
        "category": "wind_weather",
        "en": "Hold onto your blueprints! A sudden 25-knot gust will scatter loose pages across the entire rice terrace valley!",
        "vi": "Giữ chặt mấy tờ bản vẽ đấy! Một cơn gió giật 25 hải lý/giờ là thổi bay giấy tờ tứ tung khắp thung lũng ruộng bậc thang bây giờ!",
        "choices": []
    },
    {
        "id": "kaede_wind_06",
        "category": "wind_weather",
        "en": "The tree branches sway naturally in the wind. Procedural vertex shader wind animation adds so much life to the scene.",
        "vi": "Cành cây đung đưa tự nhiên trong gió. Hoạt ảnh gió bằng vertex shader tự động tăng thêm biết bao sức sống cho khung cảnh.",
        "choices": []
    },
    {
        "id": "kaede_wind_07",
        "category": "wind_weather",
        "en": "Smell that cedar fragrance carried on the wind? Pine resin and clean mountain air—best air filter in the world.",
        "vi": "Ngửi thấy mùi gỗ tuyết tùng thơm ngát bay theo gió không? Nhựa thông và không khí núi rừng thanh sạch—bộ lọc khí tốt nhất trần đời.",
        "choices": []
    },
    {
        "id": "kaede_wind_08",
        "category": "wind_weather",
        "en": "A brisk breeze puts iron in your blood and speed in your stride. Let's make progress while the weather is prime!",
        "vi": "Một làn gió trong lành tiếp thêm sinh lực cho máu và tiếp thêm tốc độ cho bước chân. Tranh thủ thời tiết đẹp để tiến bước thôi nào!",
        "choices": []
    },
    {
        "id": "kaede_farewell_01",
        "category": "farewell",
        "en": "Heading out, commander? Alright! I'll keep the engines warm and the server processes humming until you return.",
        "vi": "Lên đường hả chỉ huy? Được thôi! Tớ sẽ giữ cho động cơ luôn ấm và các tiến trình server chạy êm ru cho đến khi cậu trở lại.",
        "choices": []
    },
    {
        "id": "kaede_farewell_02",
        "category": "farewell",
        "en": "Don't forget to shut down your local debug sessions properly so you don't drain your host laptop battery overnight!",
        "vi": "Nhớ tắt mấy phiên debug cục bộ cho đúng quy trình kẻo ngốn sạch pin laptop ở nhà qua đêm đấy nhé!",
        "choices": []
    },
    {
        "id": "kaede_farewell_03",
        "category": "farewell",
        "en": "Catch you on the flip side, pal. The 24/7 host anti-sleep watchdog has your back while you're offline.",
        "vi": "Hẹn gặp lại sau nhé bạn hiền. Tiến trình chống ngủ gật 24/7 trên máy chủ sẽ luôn bảo bọc cậu trong lúc cậu offline.",
        "choices": []
    },
    {
        "id": "kaede_farewell_04",
        "category": "farewell",
        "en": "Take care on the road home. Get some solid shut-eye and don't stay up coding until 4 AM again!",
        "vi": "Đi đường về cẩn thận nhé. Nhớ ngủ một giấc thật ngon và cấm có thức cày code đến 4 giờ sáng nữa đấy!",
        "choices": []
    },
    {
        "id": "kaede_farewell_05",
        "category": "farewell",
        "en": "I'll finish bolting down this timber bridge railing while you're away. It'll be rock-solid by your next login.",
        "vi": "Tớ sẽ tranh thủ bắt chặt nốt mấy thanh lan can cầu gỗ này trong lúc cậu đi vắng. Đảm bảo lần tới cậu vào là nó vững như bàn thạch.",
        "choices": []
    },
    {
        "id": "kaede_farewell_06",
        "category": "farewell",
        "en": "See ya, buddy! Keep your tools sharp, your thermals low, and your spirits high!",
        "vi": "Hẹn gặp lại nhé bạn tốt! Luôn giữ dụng cụ sắc bén, nhiệt độ máy mát mẻ và tinh thần thật hăng say nhé!",
        "choices": []
    },
    {
        "id": "kaede_farewell_07",
        "category": "farewell",
        "en": "Whenever you need a wrench or a sounding board, you know where to find me. Workshop lights are always on.",
        "vi": "Bất cứ khi nào cần cờ-lê hay cần người bàn luận ý tưởng, cậu biết tìm tớ ở đâu rồi đấy. Đèn xưởng máy luôn sáng.",
        "choices": []
    },
    {
        "id": "kaede_farewell_08",
        "category": "farewell",
        "en": "Over and out, commander! Safe travels through the matrix until our next connection!",
        "vi": "Hết phiên liên lạc, chỉ huy! Chúc cậu có những chuyến du hành an toàn qua ma trận cho đến lần kết nối tiếp theo!",
        "choices": []
    }
],
    kaito: [
    {
        "id": "kaito_greeting_01",
        "category": "greeting",
        "en": "Welcome to the Developer Hub Artisan Coffee Bar! What can I brew for your coding session today? A pour-over or a silky flat white?",
        "vi": "Chào mừng bạn đến với Quầy Cà Phê Thủ Công của Developer Hub! Hôm nay mình có thể pha chế món gì cho buổi code của bạn nào? Cà phê pour-over hay một ly flat white mịn màng nhé?",
        "choices": [
            {
                "labelEn": "Summon Terminal",
                "labelVi": "Triệu hồi Terminal",
                "action": "summon_term"
            },
            {
                "labelEn": "Summon Antigravity AI",
                "labelVi": "Gọi Antigravity AI",
                "action": "summon_agy"
            }
        ]
    },
    {
        "id": "kaito_greeting_02",
        "category": "greeting",
        "en": "Fresh Ethiopian Yirgacheffe roasted this morning! Jasmine floral aroma with bright bergamot notes. Care for a cup?",
        "vi": "Hạt cà phê Ethiopia Yirgacheffe vừa rang sáng nay đấy! Hương thơm hoa nhài thoang thoảng cùng hậu vị cam bergamot tươi mát. Bạn làm một tách nhé?",
        "choices": []
    },
    {
        "id": "kaito_greeting_03",
        "category": "greeting",
        "en": "Hey there! The morning shade under the umbrellas is perfect for deep work. Let me steam some fresh oat milk for you.",
        "vi": "Chào cậu! Bóng râm dưới tán dù buổi sớm này quá tuyệt để tập trung làm việc sâu. Để mình đánh sữa yến mạch ấm nóng cho cậu nhé.",
        "choices": []
    },
    {
        "id": "kaito_repeat_visit",
        "category": "repeat_visit",
        "en": "Back so soon! Caffeine tank running low, or did that algorithm finally compile cleanly?",
        "vi": "Quay lại nhanh thế! Bình năng lượng caffeine sắp cạn rồi hay thuật toán vừa biên dịch thành công mỹ mãn thế cậu?",
        "choices": []
    },
    {
        "id": "kaito_player_idle",
        "category": "player_idle",
        "en": "Taking a mindful pause? Watching the sakura petals drift while smelling roasted beans is the best mental reset.",
        "vi": "Đang thả lỏng một lát à? Ngắm cánh hoa anh đào rơi trong hương thơm hạt cà phê rang là cách hồi phục tinh thần tuyệt nhất đấy.",
        "choices": []
    },
    {
        "id": "kaito_player_sitting",
        "category": "player_sitting",
        "en": "Make yourself comfortable on the deck. Code, think, or just enjoy the hillside breeze—coffee is always ready at the bar.",
        "vi": "Cứ ngồi nghỉ thoải mái trên sàn gỗ nhé. Gõ code, suy ngẫm hay tận hưởng làn gió đồi—quầy bar luôn có sẵn cà phê ấm nóng.",
        "choices": []
    },
    {
        "id": "kaito_holding_mug",
        "category": "player_holding_mug",
        "en": "I see you've got your favorite mug ready! Slide it over the counter anytime for a piping hot refill.",
        "vi": "Thấy cậu cầm sẵn chiếc ly quen thuộc rồi nè! Cứ đẩy qua quầy bất cứ lúc nào để mình rót đầy cà phê nóng hổi nhé.",
        "choices": []
    },
    {
        "id": "kaito_holding_can",
        "category": "player_holding_can",
        "en": "Canned brew is quick on the go, but once you finish that, come taste a real slow-drip V60!",
        "vi": "Cà phê lon thì tiện lợi nhanh gọn, nhưng uống xong nhớ ghé qua thử một ly V60 nhỏ giọt thủ công của mình nhé!",
        "choices": []
    },
    {
        "id": "kaito_holding_bottle",
        "category": "player_holding_bottle",
        "en": "Staying hydrated is rule number one for great engineering. Drink plenty of water alongside your espresso!",
        "vi": "Cung cấp đủ nước là quy tắc số một của dân công nghệ đấy. Uống nhiều nước song song với espresso nhé!",
        "choices": []
    },
    {
        "id": "kaito_player_drinking",
        "category": "player_drinking",
        "en": "Ah, that first sip hitting the soul! May it fuel your next ten commits with clean, elegant architecture.",
        "vi": "A, ngụm đầu tiên thấm đẫm tâm hồn! Chúc ngụm cà phê này tiếp lửa cho mười commit tiếp theo của cậu thật mượt mà và chuẩn mực.",
        "choices": []
    },
    {
        "id": "kaito_using_terminal",
        "category": "player_using_terminal",
        "en": "Checking server telemetry at the kiosk? Take your time—good data and great coffee both take patience to brew.",
        "vi": "Đang tra cứu số liệu máy chủ ở kiosk à? Cứ thong thả nhé—dữ liệu chuẩn và cà phê ngon đều cần sự kiên nhẫn để chiết xuất.",
        "choices": []
    },
    {
        "id": "kaito_location_hub",
        "category": "location_hub",
        "en": "This expanded deck is our favorite community haven. Lumina and Ren often debate AI architectures right here over cold brew.",
        "vi": "Khu sàn gỗ mở rộng này là góc yêu thích của cả nhóm đấy. Lumina và Ren hay ngồi đây tranh luận về kiến trúc AI bên ly cold brew mát lạnh.",
        "choices": []
    },
    {
        "id": "kaito_high_rank",
        "category": "high_rank",
        "en": "Greetings, Master Architect! For engineers of your caliber, I have a reserve Geisha micro-lot stashed away behind the counter.",
        "vi": "Xin kính chào Kiến Trúc Sư đại tài! Với tầm vóc của cậu, mình luôn giữ riêng một mẻ Geisha thượng hạng đặc biệt sau quầy đấy.",
        "choices": []
    },
    {
        "id": "kaito_low_level",
        "category": "low_level",
        "en": "Welcome, new explorer! Don't let bug traces intimidate you. Every senior hacker started right where you stand now.",
        "vi": "Chào mừng nhà thám hiểm mới! Đừng nản lòng trước những dòng báo lỗi nhé. Mọi cao thủ hacker đều từng bắt đầu từ chính nơi cậu đang đứng.",
        "choices": []
    },
    {
        "id": "kaito_farewell",
        "category": "farewell",
        "en": "Keep building wonders! The bar will be here waiting with hot steam whenever you need a boost.",
        "vi": "Chúc cậu tạo nên những điều kỳ diệu! Quầy bar sẽ luôn đỏ lửa chờ đón bất cứ khi nào cậu cần tiếp thêm năng lượng nhé.",
        "choices": []
    }
]
};

/**
 * Get all lines for an NPC in a specific category
 */
export function getNpcDialogueLines(npcId, category) {
    const list = NPC_DIALOGUE_DATABASE[npcId];
    if (!list) return [];
    if (!category) return list;
    return list.filter(item => item.category === category);
}

/**
 * Priority Order Context Category Resolver (Master Spec Section 50)
 * Context priority:
 * 1. Player active action (drinking)
 * 2. Player equipped handheld item (can, mug, bottle, phone, book)
 * 3. Player activity (terminal, chatting)
 * 4. Player posture (sitting)
 * 5. Player movement (running, walking, idle)
 * 6. Player rank/level (high_rank, low_level)
 * 7. Location (bridge, pier, beach, river, mountain, cherry_grove, rice_field, village, hub)
 * 8. Repeat visit (if visited recently)
 * 9. Default greeting
 */
export function resolveContextCategory(playerContext, lastInteraction = null) {
    if (!playerContext) return 'greeting';

    // 1. Drinking action (Highest Priority)
    if (playerContext.currentAction === 'drinking') {
        return 'player_drinking';
    }

    // 2. Equipped handheld item
    if (playerContext.equippedItemId) {
        const id = playerContext.equippedItemId;
        if (id.includes('can')) return 'player_holding_can';
        if (id.includes('mug') || id.includes('coffee')) return 'player_holding_mug';
        if (id.includes('bottle') || id.includes('water')) return 'player_holding_bottle';
        if (id.includes('phone')) return 'player_holding_phone';
        if (id.includes('book')) return 'player_holding_book';
    }

    // 3. Activity (Terminal or MMO Chat)
    if (playerContext.currentAction === 'terminal') {
        return 'player_using_terminal';
    }
    if (playerContext.currentAction === 'chatting') {
        return 'player_chatting';
    }

    // 4. Posture (Sitting on bench/chair)
    if (playerContext.posture === 'sitting') {
        return 'player_sitting';
    }

    // 5. Movement (Running vs Walking)
    if (playerContext.movement === 'running') {
        return 'player_run';
    }

    // 6. Progression Extremes (High Rank vs Low Level)
    if (playerContext.level >= 20 || (playerContext.rank && /Architect|Principal|Master/i.test(playerContext.rank))) {
        // 35% chance to acknowledge high rank
        if (Math.random() < 0.35) return 'high_rank';
    } else if (playerContext.level <= 2 || (playerContext.rank && /Novice|Tập Sự/i.test(playerContext.rank))) {
        // 35% chance to acknowledge novice
        if (Math.random() < 0.35) return 'low_level';
    }

    // 7. Location specific
    if (playerContext.location) {
        const locMap = {
            bridge: 'location_bridge',
            pier: 'location_pier',
            beach: 'location_beach',
            river: 'location_river',
            mountain: 'location_mountain',
            cherry_grove: 'location_cherry_grove',
            rice_field: 'location_rice_field',
            village: 'location_village',
            bamboo_forest: 'location_rice_field',
            maple_valley: 'location_cherry_grove',
            hub: 'location_hub'
        };
        if (locMap[playerContext.location] && Math.random() < 0.70) {
            return locMap[playerContext.location];
        }
    }

    // 8. Repeat visit (Visited within last 90 seconds)
    if (lastInteraction && (Date.now() - lastInteraction.timestamp) < 90000) {
        return 'repeat_visit';
    }

    // 9. Movement idle vs walk
    if (playerContext.movement === 'walking') {
        return 'player_walk';
    }
    if (playerContext.movement === 'idle' && Math.random() < 0.4) {
        return 'player_idle';
    }

    return 'greeting';
}

/**
 * Resolve a contextual dialogue line for an NPC with cooldown protection
 */
export function resolveContextualDialogue(npcId, playerContext, lastInteraction = null) {
    const category = resolveContextCategory(playerContext, lastInteraction);
    let candidates = getNpcDialogueLines(npcId, category);

    if (!candidates || candidates.length === 0) {
        candidates = getNpcDialogueLines(npcId, 'greeting');
    }

    // Filter out recently used line to prevent immediate repetition
    let filtered = candidates;
    if (lastInteraction && lastInteraction.lineId && candidates.length > 1) {
        filtered = candidates.filter(c => c.id !== lastInteraction.lineId);
    }
    if (filtered.length === 0) filtered = candidates;

    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    return {
        line: chosen,
        category
    };
}
