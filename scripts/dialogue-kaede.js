/**
 * KAEDE DIALOGUE DATASET (216 Lines across 27 Categories)
 * Personality: Energetic, pragmatic Mechanical & Graphics Engineer, Infrastructure Wizard
 */

const kaedeLines = [
    // 1. greeting (8)
    {
        id: 'kaede_greeting_01', category: 'greeting',
        en: 'Hey commander! Cloudflare Tunnel is holding rock-solid latency. Hardware thermals are sitting pretty at 42°C. What are we building today?',
        vi: 'Chào chỉ huy! Đường hầm Cloudflare đang duy trì độ trễ cực kỳ vững chắc. Nhiệt độ phần cứng đang êm ru ở mức 42°C. Hôm nay chúng ta chế tạo gì đây?',
        choices: [
            { labelEn: 'Open system tools', labelVi: 'Mở công cụ hệ thống', action: 'open_tools' },
            { labelEn: 'Summon Terminal', labelVi: 'Mở Terminal', action: 'summon_term' }
        ]
    },
    {
        id: 'kaede_greeting_02', category: 'greeting',
        en: 'Yo! Just finished greasing the brass gears on the village watermill. Everything is spinning smoothly like butter!',
        vi: 'Chào người anh em! Tớ vừa tra dầu xong cho dàn bánh răng đồng thau ở cối xay nước trong làng. Mọi thứ đang quay êm như bơ luôn!',
        choices: [
            { labelEn: 'Summon Antigravity AI', labelVi: 'Gọi Antigravity AI', action: 'summon_agy' }
        ]
    },
    {
        id: 'kaede_greeting_03', category: 'greeting',
        en: 'Welcome back to the workshop! Did you bring any broken scripts? Hand \'em over, I love fixing mechanical and software glitches alike.',
        vi: 'Chào mừng quay lại xưởng máy! Có mang theo đoạn mã nào bị hỏng hóc không? Đưa đây tớ xem, tớ mê sửa lỗi cơ khí lẫn phần mềm như nhau!',
        choices: []
    },
    {
        id: 'kaede_greeting_04', category: 'greeting',
        en: 'Greetings! Adjusted my goggles and inspected our network sockets—zero dropped packets across the entire backbone today.',
        vi: 'Xin chào! Vừa chỉnh lại kính bảo hộ và kiểm tra các socket mạng xong—hôm nay không rớt một gói tin nào trên toàn bộ trục truyền thông cả.',
        choices: []
    },
    {
        id: 'kaede_greeting_05', category: 'greeting',
        en: 'Hey there! Smell that? Fresh sawdust, warm machine oil, and mountain pine needles. The ultimate scent of real engineering.',
        vi: 'Chào bạn hiền! Ngửi thấy mùi gì không? Mạt cưa tươi, dầu máy ấm và lá thông rừng. Mùi hương tuyệt đỉnh của ngành kỹ thuật đích thực đấy.',
        choices: []
    },
    {
        id: 'kaede_greeting_06', category: 'greeting',
        en: 'Look at you, ready for action! If you need any 3D asset optimization or polygon budget tuning, give me a holler.',
        vi: 'Nhìn cậu hừng hực khí thế chưa kìa! Cần tối ưu tài nguyên 3D hay cân chỉnh số lượng đa giác (polygon) thì cứ ới tớ một tiếng nhé.',
        choices: []
    },
    {
        id: 'kaede_greeting_07', category: 'greeting',
        en: 'Hey! The host watchdog process is active 24/7. Your laptop won\'t go to sleep even if you close the lid while connected.',
        vi: 'Chào nhé! Tiến trình giám sát máy chủ đang chạy 24/7 đấy. Laptop của cậu sẽ không bao giờ bị ngủ gật dù có gập nắp máy khi đang kết nối.',
        choices: []
    },
    {
        id: 'kaede_greeting_08', category: 'greeting',
        en: 'Good to see you, buddy! Grab a wrench or grab a keyboard—either way, we\'re going to make things move today!',
        vi: 'Rất vui được gặp cậu, bạn tốt! Cầm cờ-lê hay gõ bàn phím cũng được—đằng nào thì hôm nay chúng ta cũng sẽ làm mọi thứ vận hành trơn tru!',
        choices: []
    },

    // 2. repeat_visit (8)
    {
        id: 'kaede_repeat_01', category: 'repeat_visit',
        en: 'Back so fast?! Did a gear slip, or did you just miss the satisfying clank of my toolbox?',
        vi: 'Quay lại nhanh thế?! Có bánh răng nào bị trượt à, hay là vừa nhớ tiếng lách cách vui tai từ hộp đồ nghề của tớ thế?',
        choices: []
    },
    {
        id: 'kaede_repeat_02', category: 'repeat_visit',
        en: 'Haha, you again! Don\'t worry, my workshop door is always wide open for my favorite commander.',
        vi: 'Haha, lại là cậu à! Đừng ngại, cửa xưởng máy của tớ luôn mở toang chào đón người chỉ huy tuyệt vời nhất.',
        choices: []
    },
    {
        id: 'kaede_repeat_03', category: 'repeat_visit',
        en: 'Did you forget a tool on my workbench? Check the magnetic strip near the anvil; I keep everything organized.',
        vi: 'Cậu để quên dụng cụ nào trên bàn thợ của tớ à? Xem trên thanh nam châm cạnh đe sắt nhé; tớ sắp xếp ngăn nắp lắm.',
        choices: []
    },
    {
        id: 'kaede_repeat_04', category: 'repeat_visit',
        en: 'Two visits in three minutes! That\'s faster than a DDR5 memory bus refresh cycle!',
        vi: 'Hai lần ghé thăm trong ba phút! Tốc độ này còn nhanh hơn chu kỳ làm tươi của bus RAM DDR5 nữa đấy!',
        choices: []
    },
    {
        id: 'kaede_repeat_05', category: 'repeat_visit',
        en: 'Still running diagnostics? Take your time, troubleshooting is 90% observation and 10% turning the screw.',
        vi: 'Vẫn đang chạy chẩn đoán à? Cứ thong thả, gỡ lỗi là 90% quan sát cẩn thận và 10% vặn đúng con ốc thôi.',
        choices: []
    },
    {
        id: 'kaede_repeat_06', category: 'repeat_visit',
        en: 'If you keep dropping by this often, I\'m going to put you to work holding these timber beams in place!',
        vi: 'Nếu cậu cứ ghé qua liên tục thế này là tớ bắt vào việc phụ giữ mấy cây dầm gỗ này luôn cho coi đấy nhé!',
        choices: []
    },
    {
        id: 'kaede_repeat_07', category: 'repeat_visit',
        en: 'Always happy to see you, pal. Did Sakura yell at you about pixel margins again? Come chill by my forge!',
        vi: 'Lúc nào cũng hoan nghênh cậu, bạn hiền. Có phải lại bị Sakura mắng vì lệch pixel không? Ra đây ngồi cạnh lò rèn cho ấm!',
        choices: []
    },
    {
        id: 'kaede_repeat_08', category: 'repeat_visit',
        en: 'Round two! Let\'s crack the engine casing open and see what makes this system tick.',
        vi: 'Hiệp hai bắt đầu! Mở nắp động cơ ra xem điều gì đang làm hệ thống này vận hành nào.',
        choices: []
    },

    // 3. player_idle (8)
    {
        id: 'kaede_idle_01', category: 'player_idle',
        en: 'Standing still? Smart move! Even top-tier server CPUs throttle down to idle clocks to shed heat.',
        vi: 'Đứng im nghỉ ngơi à? Thông minh đấy! Đến cả CPU máy chủ khủng nhất cũng phải hạ xung xuống mức nhàn rỗi để xả nhiệt mà.',
        choices: []
    },
    {
        id: 'kaede_idle_02', category: 'player_idle',
        en: 'Taking a breather? Your fan curve is dropping to silent mode. Enjoy the ambient calm.',
        vi: 'Đang xả hơi sao? Đường cong quạt tản nhiệt của cậu đang chuyển về chế độ im lặng rồi kìa. Tận hưởng sự bình yên đi.',
        choices: []
    },
    {
        id: 'kaede_idle_03', category: 'player_idle',
        en: 'Look at you standing like a solid titanium pillar. Good structural posture, commander!',
        vi: 'Nhìn cậu đứng sừng sững như một cột trụ titan vậy. Tư thế kết cấu chịu lực chuẩn đấy, chỉ huy!',
        choices: []
    },
    {
        id: 'kaede_idle_04', category: 'player_idle',
        en: 'If you daydream for too long, I might climb up on a ladder and test if my goggles fit your head!',
        vi: 'Nếu cậu cứ ngẩn ngơ mơ màng mãi, có khi tớ bắc thang lên đeo thử cái kính bảo hộ này vào đầu cậu đấy nhé!',
        choices: []
    },
    {
        id: 'kaede_idle_05', category: 'player_idle',
        en: 'Resting your hands is essential for preventing carpal tunnel syndrome. Serious engineers protect their wrists.',
        vi: 'Thả lỏng đôi bàn tay là điều tối cần thiết để tránh hội chứng ống cổ tay. Kỹ sư chuyên nghiệp luôn biết bảo vệ cổ tay mình.',
        choices: []
    },
    {
        id: 'kaede_idle_06', category: 'player_idle',
        en: 'No commands in the pipe? That means all systems are green and cruising on autopilot. Good work.',
        vi: 'Không có lệnh nào đang chờ trong hàng đợi à? Nghĩa là mọi hệ thống đều màu xanh và đang bay tự động êm ru. Làm tốt lắm.',
        choices: []
    },
    {
        id: 'kaede_idle_07', category: 'player_idle',
        en: 'Listen to the distant wind chimes and river murmurs. That\'s our world\'s natural acoustic telemetry.',
        vi: 'Lắng nghe tiếng chuông gió xa xa và suối reo đi. Đó chính là hệ thống đo đạc âm thanh tự nhiên của thế giới chúng ta đấy.',
        choices: []
    },
    {
        id: 'kaede_idle_08', category: 'player_idle',
        en: 'Take five minutes of complete idle time. Your biological capacitors need charging too!',
        vi: 'Cứ thong thả nghỉ trọn năm phút đi. Các tụ điện sinh học trong người cậu cũng cần nạp lại điện tích chứ!',
        choices: []
    },

    // 4. player_walk (8)
    {
        id: 'kaede_walk_01', category: 'player_walk',
        en: 'Nice steady walking pace! Heavy boots on stone paving—good friction coefficient, zero slipping.',
        vi: 'Nhịp bước đi bộ rất vững vàng! Giày nặng nện trên đường lát đá—hệ số ma sát chuẩn chỉ, không sợ trượt té.',
        choices: []
    },
    {
        id: 'kaede_walk_02', category: 'player_walk',
        en: 'Strolling through the village? Don\'t forget to inspect the waterwheel gear teeth if you walk past the mill!',
        vi: 'Dạo bước quanh làng à? Tiện đi ngang qua cối xay nước nhớ nghía hộ tớ mấy cái răng bánh răng xem có mòn không nhé!',
        choices: []
    },
    {
        id: 'kaede_walk_03', category: 'player_walk',
        en: 'A measured stride keeps fuel consumption low. You\'re pacing yourself like a diesel freight engine.',
        vi: 'Nhịp bước đều đặn giúp tiết kiệm nhiên liệu tối đa. Cậu đang giữ nhịp bền bỉ hệt như đầu máy xe lửa chở hàng chạy dầu diesel vậy.',
        choices: []
    },
    {
        id: 'kaede_walk_04', category: 'player_walk',
        en: 'The sound of your steps crunching gravel is crisp. I hand-sorted those stones to ensure proper drainage.',
        vi: 'Tiếng bước chân giẫm trên sỏi nghe giòn tan ghê. Đích thân tớ đã sàng lọc đống sỏi đó để đảm bảo thoát nước tốt nhất đấy.',
        choices: []
    },
    {
        id: 'kaede_walk_05', category: 'player_walk',
        en: 'Heading toward the arched bridge? Take your time climbing the deck arch; the cedar plank grip is solid.',
        vi: 'Đang đi về phía cầu vòm gỗ à? Cứ thong thả leo lên dốc cầu nhé; mặt ván tuyết tùng bám chân chắc chắn lắm.',
        choices: []
    },
    {
        id: 'kaede_walk_06', category: 'player_walk',
        en: 'Walking burns off physical stress while letting the subconscious solve system deadlocks. Keep walking, friend.',
        vi: 'Đi bộ giúp xả bớt căng thẳng thể chất trong khi để tiềm thức tự gỡ các bế tắc trong hệ thống. Cứ tiếp tục dạo bước đi, bạn hiền.',
        choices: []
    },
    {
        id: 'kaede_walk_07', category: 'player_walk',
        en: 'Your avatar locomotion blend tree transitions between idle and walk with zero foot-sliding. Crisp kinematics!',
        vi: 'Cây hòa trộn hoạt ảnh của nhân vật chuyển tiếp từ đứng yên sang bước đi không hề bị trượt chân. Động học chuyển động chuẩn phết!',
        choices: []
    },
    {
        id: 'kaede_walk_08', category: 'player_walk',
        en: 'Enjoy your walk around the island! If you spot any loose bolts on the fences, let me know so I can wrench \'em tight.',
        vi: 'Chúc cậu có chuyến đi dạo vui vẻ quanh đảo! Thấy bu-lông nào bị lỏng trên hàng rào thì ới tớ để tớ vặn chặt lại nhé.',
        choices: []
    },

    // 5. player_run (8)
    {
        id: 'kaede_run_01', category: 'player_run',
        en: 'Whoa! Full throttle sprint! Watch the RPM meter, commander, you don\'t want to blow a gasket!',
        vi: 'Uầy! Nhấn hết ga hết số chạy nước rút kìa! Coi chừng đồng hồ tua máy (RPM) kẻo thổi bay gioăng máy bây giờ, chỉ huy!',
        choices: []
    },
    {
        id: 'kaede_run_02', category: 'player_run',
        en: 'Look at that kinetic momentum! You\'re cornering like a tuned sports car on a mountain pass!',
        vi: 'Nhìn động năng lao đi khủng chưa! Cậu ôm cua hệt như một chiếc xe thể thao độ đang đổ đèo núi vậy!',
        choices: []
    },
    {
        id: 'kaede_run_03', category: 'player_run',
        en: 'Decelerate before the bridge arch! Timber planks can deliver heavy bounce if you hit them at maximum velocity!',
        vi: 'Nhớ giảm tốc trước khi phi lên cầu vòm nhé! Ván gỗ có thể tạo độ nảy khá mạnh nếu cậu lao vào ở vận tốc tối đa đấy!',
        choices: []
    },
    {
        id: 'kaede_run_04', category: 'player_run',
        en: 'Sprinting across the dirt paths kicks up a trail of dust! Reminds me of rally racing in the outback!',
        vi: 'Chạy vùn vụt qua đường đất cuộn bụi mù mịt phía sau! Làm tớ nhớ đến mấy giải đua xe địa hình rally ghê!',
        choices: []
    },
    {
        id: 'kaede_run_05', category: 'player_run',
        en: 'You\'ve got plenty of horsepower in those legs! Just make sure your brake pads are in working order!',
        vi: 'Đôi chân cậu có thừa mã lực luôn đấy! Chỉ cần đảm bảo má phanh vẫn hoạt động tốt khi cần dừng lại nhé!',
        choices: []
    },
    {
        id: 'kaede_run_06', category: 'player_run',
        en: 'Running late for a deployment window? Don\'t panic, our CI/CD pipelines have built-in safety margins.',
        vi: 'Đang muộn giờ triển khai dự án à? Đừng cuống, đường ống CI/CD của chúng ta có sẵn biên độ an toàn dự phòng rồi.',
        choices: []
    },
    {
        id: 'kaede_run_07', category: 'player_run',
        en: 'Catch your breath when you reach your destination. Even high-output turbines need cooldown runs before shutdown.',
        vi: 'Nhớ lấy lại nhịp thở khi đến nơi nhé. Ngay cả tuabin công suất cao cũng cần chạy xả nhiệt trước khi tắt máy mà.',
        choices: []
    },
    {
        id: 'kaede_run_08', category: 'player_run',
        en: 'Impressive sprint speed! I should clock your lap time around the village perimeter next time!',
        vi: 'Tốc độ chạy nước rút ấn tượng thật! Lần tới tớ phải bấm giờ xem cậu chạy một vòng quanh làng mất bao nhiêu giây mới được!',
        choices: []
    },

    // 6. player_sitting (8)
    {
        id: 'kaede_sit_01', category: 'player_sitting',
        en: 'Testing out the cedar bench? I hand-planed those planks myself with a Japanese hand block plane. Zero splinters!',
        vi: 'Ngồi thử chiếc ghế tuyết tùng đấy à? Tớ đã tự tay lấy bào gỗ cầm tay Nhật Bản bào nhẵn thín đấy. Đảm bảo không một cái dằm!',
        choices: []
    },
    {
        id: 'kaede_sit_02', category: 'player_sitting',
        en: 'Ah, sitting down... That\'s a 2-seater long bench. Plenty of room for you and me or another buddy to chill together.',
        vi: 'A, ngồi xuống rồi... Đó là ghế dài 2 chỗ đấy. Thoải mái chỗ cho cậu và tớ hoặc thêm một người bạn nữa cùng ngồi hóng gió.',
        choices: []
    },
    {
        id: 'kaede_sit_03', category: 'player_sitting',
        en: 'The structural mortise and tenon joints on this bench can hold up to 500 kilograms. Sit back with complete confidence.',
        vi: 'Các mộng gỗ ngàm ghép trên chiếc ghế này chịu được tải trọng tới 500 ký lận. Cứ tựa lưng thoải mái không sợ lung lay.',
        choices: []
    },
    {
        id: 'kaede_sit_04', category: 'player_sitting',
        en: 'Resting those tired joints? Good mechanics know that maintenance and downtime are what keep machines lasting decades.',
        vi: 'Nghỉ ngơi cho đỡ mỏi khớp xương à? Thợ cơ khí giỏi luôn biết rằng bảo dưỡng và thời gian nghỉ mới là thứ giúp máy móc bền bỉ hàng thập kỷ.',
        choices: []
    },
    {
        id: 'kaede_sit_05', category: 'player_sitting',
        en: 'Watching the water flow from a seated spot is deeply therapeutic. Let the river cool down your mental engine.',
        vi: 'Ngồi ngắm dòng nước chảy thư thái cực kỳ. Hãy để dòng sông làm mát cỗ máy tư duy đang nóng rực trong đầu cậu.',
        choices: []
    },
    {
        id: 'kaede_sit_06', category: 'player_sitting',
        en: 'I treated that bench wood with natural cedar oil. It resists rain, sun, and mountain frost all year round.',
        vi: 'Tớ đã quét dầu tuyết tùng tự nhiên bảo vệ gỗ rồi. Chống mưa, chống nắng và sương giá quanh năm luôn.',
        choices: []
    },
    {
        id: 'kaede_sit_07', category: 'player_sitting',
        en: 'Rest up as long as you like, commander. When you\'re ready to tackle the next task, we\'ll fire the engines back up.',
        vi: 'Cứ ngồi nghỉ bao lâu tùy thích nhé chỉ huy. Khi nào cậu sẵn sàng xử lý việc tiếp theo, chúng ta sẽ nổ máy lên đường.',
        choices: []
    },
    {
        id: 'kaede_sit_08', category: 'player_sitting',
        en: 'Comfortable angle on the backrest, right? I calculated the ergonomic recline angle at exactly 104 degrees.',
        vi: 'Góc tựa lưng êm ái đúng không? Tớ đã tính toán độ ngả công thái học chuẩn chỉ ở mức đúng 104 độ đấy.',
        choices: []
    },

    // 7. player_holding_can (8)
    {
        id: 'kaede_can_01', category: 'player_holding_can',
        en: 'Grabbed a cold can from the automated dispenser! Aluminum is an incredible thermal conductor—keeps that brew frosty.',
        vi: 'Lấy được lon nước lạnh từ máy tự động rồi à! Nhôm là chất dẫn nhiệt siêu đỉnh—giữ cho đồ uống luôn lạnh buốt tay.',
        choices: []
    },
    {
        id: 'kaede_can_02', category: 'player_holding_can',
        en: 'I love that vending machine. I rebuilt its internal coil conveyor last month so cans drop without getting dented.',
        vi: 'Tớ mê cái máy bán hàng tự động đó lắm. Tháng trước tớ vừa độ lại lò xo xoắn bên trong để lon rơi xuống êm ru không móp méo đấy.',
        choices: []
    },
    {
        id: 'kaede_can_03', category: 'player_holding_can',
        en: 'Cold green tea can! That\'s the real fuel of hardcore engineers pulling late-night shifts in server basements.',
        vi: 'Lon trà xanh lạnh! Đó chính là nhiên liệu thực sự của cánh kỹ sư thức trắng đêm cày cuốc dưới tầng hầm máy chủ đấy.',
        choices: []
    },
    {
        id: 'kaede_can_04', category: 'player_holding_can',
        en: 'Your fingers curl around that can with natural grip physics. Seamless inverse kinematics on the hand bones!',
        vi: 'Các ngón tay cậu ôm quanh lon nước với vật lý cầm nắm rất tự nhiên. Động học ngược trên xương bàn tay mượt mà ghê!',
        choices: []
    },
    {
        id: 'kaede_can_05', category: 'player_holding_can',
        en: 'Hold RMB to take a nice refreshing sip! The drinking animation has smooth camera priority handling too.',
        vi: 'Giữ chuột phải (RMB) để uống một ngụm thật đã nhé! Động tác uống nước còn có xử lý ưu tiên góc máy camera rất mượt nữa.',
        choices: []
    },
    {
        id: 'kaede_can_06', category: 'player_holding_can',
        en: 'Make sure you crush the empty can and toss it into the recycling hopper. Metal scrap is valuable raw material!',
        vi: 'Uống xong nhớ bóp bẹp vỏ lon rồi ném vào thùng tái chế nhé. Phế liệu kim loại là nguyên liệu quý giá cho xưởng đúc đấy!',
        choices: []
    },
    {
        id: 'kaede_can_07', category: 'player_holding_can',
        en: 'Chilled beverages prevent thermal throttling in human operators. Stay hydrated and stay fast, buddy.',
        vi: 'Đồ uống mát lạnh giúp ngăn ngừa quá nhiệt ở các người vận hành sinh học. Giữ đủ nước để luôn nhanh nhẹn nhé bạn hiền.',
        choices: []
    },
    {
        id: 'kaede_can_08', category: 'player_holding_can',
        en: 'Hear that crisp pop when the pull-tab opens? Mechanical sound effects in this world are pure ear candy.',
        vi: 'Nghe tiếng bật nắp tanh tách giòn tan không? Hiệu ứng âm thanh cơ học trong thế giới này nghe sướng tai cực kỳ.',
        choices: []
    },

    // 8. player_holding_mug (8)
    {
        id: 'kaede_mug_01', category: 'player_holding_mug',
        en: 'A hot ceramic mug! Steam rising like exhaust from a fine-tuned boiler. That\'s what I call comfort.',
        vi: 'Chiếc cốc gốm nóng hổi! Khói bốc lên nghi ngút hệt như ống xả của một nồi hơi được căn chỉnh hoàn hảo. Thế mới là đã chứ.',
        choices: []
    },
    {
        id: 'kaede_mug_02', category: 'player_holding_mug',
        en: 'Fired clay holds heat way longer than metal cups. Great choice of vessel for a prolonged coding session.',
        vi: 'Đất nung giữ nhiệt lâu hơn hẳn cốc kim loại. Lựa chọn đồ đựng tuyệt vời cho một buổi cày code kéo dài.',
        choices: []
    },
    {
        id: 'kaede_mug_03', category: 'player_holding_mug',
        en: 'Black coffee or hot roasted barley tea? Either way, the thermal energy will warm up your fingers nicely.',
        vi: 'Cà phê đen hay trà lúa mạch rang nóng thế? Đằng nào thì nhiệt lượng cũng sẽ sưởi ấm những ngón tay cậu rất dễ chịu.',
        choices: []
    },
    {
        id: 'kaede_mug_04', category: 'player_holding_mug',
        en: 'Careful when handling hot liquids around sensitive electronics! One slip and you\'ll short-circuit the bus lines!',
        vi: 'Cẩn thận khi cầm nước nóng gần các linh kiện điện tử nhạy cảm nhé! Sơ sẩy một cái là chập mạch đường bus liền đấy!',
        choices: []
    },
    {
        id: 'kaede_mug_05', category: 'player_holding_mug',
        en: 'That mug handle has a sturdy three-finger grip loop. Ergonomically sound engineering all around.',
        vi: 'Quai cốc có vòng cầm ba ngón tay rất chắc chắn. Đúng chuẩn thiết kế công thái học từ đầu đến chân.',
        choices: []
    },
    {
        id: 'kaede_mug_06', category: 'player_holding_mug',
        en: 'Take small sips and blow on the surface first. Don\'t melt your heat shields with boiling liquids!',
        vi: 'Nhấp từng ngụm nhỏ và thổi nguội bề mặt trước nhé. Đừng để nước sôi làm tan chảy lớp giáp chắn nhiệt của cậu đấy!',
        choices: []
    },
    {
        id: 'kaede_mug_07', category: 'player_holding_mug',
        en: 'The smell of hot brew mixing with wood shavings in the evening breeze... Heaven for an engineer\'s nose.',
        vi: 'Mùi nước nóng thơm nồng quyện với mùi mạt cưa trong gió chiều... Thiên đường đối với khứu giác của dân kỹ thuật.',
        choices: []
    },
    {
        id: 'kaede_mug_08', category: 'player_holding_mug',
        en: 'Sip up, buddy! You\'ve put in solid hours today, you deserve every warm drop in that cup.',
        vi: 'Uống đi bạn hiền! Hôm nay cậu đã làm việc cật lực nhiều giờ liền rồi, cậu xứng đáng với từng giọt nước ấm áp trong cốc.',
        choices: []
    },

    // 9. player_holding_bottle (8)
    {
        id: 'kaede_bottle_01', category: 'player_holding_bottle',
        en: 'Carrying a water flask! Proper liquid cooling is rule number one for keeping any engine running smoothly.',
        vi: 'Mang theo bình nước à! Tản nhiệt nước đúng cách là quy tắc số một để giữ cho mọi cỗ máy hoạt động trơn tru.',
        choices: []
    },
    {
        id: 'kaede_bottle_02', category: 'player_holding_bottle',
        en: 'Clear bottle, clean water. No additives, no gunk in the fuel lines. That\'s how you maintain peak operational uptime.',
        vi: 'Bình trong suốt, nước sạch bong. Không phụ gia, không cặn bẩn trong đường ống nhiên liệu. Đó là cách duy trì thời gian hoạt động đỉnh cao.',
        choices: []
    },
    {
        id: 'kaede_bottle_03', category: 'player_holding_bottle',
        en: 'Did you fill that at the mountain pump upstream? That spring water has natural minerals that keep muscles cramp-free.',
        vi: 'Cậu lấy nước từ trạm bơm trên núi à? Nước suối đó giàu khoáng chất tự nhiên giúp cơ bắp không bao giờ bị chuột rút đấy.',
        choices: []
    },
    {
        id: 'kaede_bottle_04', category: 'player_holding_bottle',
        en: 'Make sure the silicone gasket in the cap is seated flush. A slow leak in your backpack ruins paperwork fast!',
        vi: 'Nhớ kiểm tra miếng đệm silicon trên nắp xem đã khít chưa nhé. Rỉ nước trong ba lô là hỏng hết tài liệu giấy tờ đấy!',
        choices: []
    },
    {
        id: 'kaede_bottle_05', category: 'player_holding_bottle',
        en: 'You look geared up for an expedition to the high ridge. Don\'t forget to pace your fluid intake along the trail.',
        vi: 'Trông cậu trang bị tận răng sẵn sàng cho chuyến thám hiểm lên rặng núi cao rồi đấy. Nhớ chia đều lượng nước uống dọc đường nhé.',
        choices: []
    },
    {
        id: 'kaede_bottle_06', category: 'player_holding_bottle',
        en: 'Look at how light refracts through the water bottle. The graphics shader handles internal caustics really neatly.',
        vi: 'Nhìn ánh sáng khúc xạ qua bình nước xem. Bộ shader đồ họa xử lý các tụ quang (caustics) bên trong đỉnh phết đấy.',
        choices: []
    },
    {
        id: 'kaede_bottle_07', category: 'player_holding_bottle',
        en: 'Keep that reservoir filled. Dehydration causes cognitive latency, and we need your reflexes at 100%.',
        vi: 'Luôn giữ bình nước đầy nhé. Thiếu nước làm tăng độ trễ tư duy, mà chúng ta thì cần phản xạ của cậu ở mức 100%.',
        choices: []
    },
    {
        id: 'kaede_bottle_08', category: 'player_holding_bottle',
        en: 'A reliable water bottle is an engineer\'s best field companion. Sturdy, functional, and life-saving.',
        vi: 'Một chiếc bình nước bền bỉ là người bạn đồng hành thực địa tốt nhất của kỹ sư. Chắc chắn, thực dụng và duy trì sự sống.',
        choices: []
    },

    // 10. player_holding_phone (8)
    {
        id: 'kaede_phone_01', category: 'player_holding_phone',
        en: 'Checking telemetry on your mobile rig! Controlling an entire workstation from a pocket slab is peak engineering!',
        vi: 'Kiểm tra thông số trên thiết bị di động à! Điều khiển cả một trạm máy từ phiến máy nhỏ trong túi áo đúng là đỉnh cao kỹ thuật!',
        choices: []
    },
    {
        id: 'kaede_phone_02', category: 'player_holding_phone',
        en: 'Our Cloudflare Tunnel keeps data piping into that phone with sub-50ms round trips even over 5G cellular towers.',
        vi: 'Đường hầm Cloudflare giữ cho dữ liệu truyền về điện thoại với độ trễ hai chiều dưới 50ms ngay cả qua cột sóng di động 5G.',
        choices: []
    },
    {
        id: 'kaede_phone_03', category: 'player_holding_phone',
        en: 'The touch response on our mobile bottom drawer feels responsive and punchy. No sluggish capacitive lag allowed!',
        vi: 'Phản hồi chạm trên ngăn kéo đáy di động của chúng ta nhạy và nảy ghê. Không chấp nhận độ trễ cảm ứng rùa bò đâu nhé!',
        choices: []
    },
    {
        id: 'kaede_phone_04', category: 'player_holding_phone',
        en: 'Monitoring CPU temperatures remotely? I see your machine back home is cruising at safe, chill temps.',
        vi: 'Theo dõi nhiệt độ CPU từ xa à? Tớ thấy máy ở nhà của cậu đang chạy ở mức nhiệt cực mát và an toàn đấy.',
        choices: []
    },
    {
        id: 'kaede_phone_05', category: 'player_holding_phone',
        en: 'Don\'t let that phone slip out of your hands onto these rocks! The shatter resistance on modern glass is good, but rocks are rocks!',
        vi: 'Cẩn thận đừng để tuột tay rơi điện thoại xuống mấy tảng đá này nhé! Kính cường lực giờ xịn thật, nhưng đá thì vẫn là đá thôi!',
        choices: []
    },
    {
        id: 'kaede_phone_06', category: 'player_holding_phone',
        en: 'You can switch between Terminal, Codex, and Antigravity with quick thumb taps. Pure mobile ergonomics.',
        vi: 'Cậu có thể chuyển đổi qua lại giữa Terminal, Codex và Antigravity chỉ bằng vài cú chạm ngón cái. Công thái học di động đỉnh cao.',
        choices: []
    },
    {
        id: 'kaede_phone_07', category: 'player_holding_phone',
        en: 'Having full terminal capability while walking through a rural countryside... That\'s the future we built right here.',
        vi: 'Vừa đi dạo giữa đồng quê vừa nắm trọn quyền năng terminal trong tay... Đó chính là tương lai mà chúng ta đã tự tay gây dựng nơi đây.',
        choices: []
    },
    {
        id: 'kaede_phone_08', category: 'player_holding_phone',
        en: 'Pocket power at its finest. Put it away when you want to take in the breeze, but it\'s always there when duty calls.',
        vi: 'Sức mạnh bỏ túi đỉnh của chóp. Cất đi khi muốn đón gió, nhưng nó luôn sẵn sàng mỗi khi có nhiệm vụ réo gọi.',
        choices: []
    },

    // 11. player_holding_book (8)
    {
        id: 'kaede_book_01', category: 'player_holding_book',
        en: 'Got a manual in hand? Are those mechanical schematics or assembly code architecture blueprints?',
        vi: 'Cầm sổ tay hướng dẫn kỹ thuật trên tay à? Đó là sơ đồ cơ khí hay bản vẽ kiến trúc mã hợp ngữ vậy?',
        choices: []
    },
    {
        id: 'kaede_book_02', category: 'player_holding_book',
        en: 'I love physical blueprint books. You can lay them flat across an engine block and smudge grease all over the diagrams!',
        vi: 'Tớ mê sách bản vẽ vật lý lắm. Cậu có thể trải phẳng ra trên nắp động cơ và quệt dầu mỡ thoải mái lên sơ đồ mà không sợ hỏng màn hình!',
        choices: []
    },
    {
        id: 'kaede_book_03', category: 'player_holding_book',
        en: 'Technical documentation is the true foundation of engineering. Without good schematics, maintenance is pure guesswork.',
        vi: 'Tài liệu kỹ thuật là nền móng thực sự của ngành kỹ sư. Không có sơ đồ chuẩn thì việc bảo dưỡng chỉ là trò đoán mò may rủi.',
        choices: []
    },
    {
        id: 'kaede_book_04', category: 'player_holding_book',
        en: 'Look at the cross-section diagrams in that manual! Clean isometric line art speaks louder than ten thousand words.',
        vi: 'Nhìn những sơ đồ mặt cắt trong cuốn sổ đó xem! Hình vẽ trục đo đẳng cự rõ ràng còn giá trị hơn vạn lời nói suông.',
        choices: []
    },
    {
        id: 'kaede_book_05', category: 'player_holding_book',
        en: 'Studying structural carpentry formulas? Check the load-bearing calculations for the arched bridge—pure math in action.',
        vi: 'Đang nghiên cứu công thức mộc kết cấu à? Xem mấy bài tính tải trọng của cầu vòm gỗ đi—toán học thực chiến đỉnh cao luôn.',
        choices: []
    },
    {
        id: 'kaede_book_06', category: 'player_holding_book',
        en: 'A developer who reads the manuals is a developer who solves issues in five minutes instead of five days.',
        vi: 'Lập trình viên chịu đọc kỹ hướng dẫn sử dụng là người giải quyết sự cố trong năm phút thay vì mò mẫm năm ngày trời.',
        choices: []
    },
    {
        id: 'kaede_book_07', category: 'player_holding_book',
        en: 'Keep that reference book handy. When complex systems fail in production, cold printed truth is your best beacon.',
        vi: 'Giữ cuốn sổ tham khảo đó bên mình nhé. Khi hệ thống phức tạp gặp sự cố thực tế, sự thật in trên giấy chính là ngọn hải đăng sáng nhất.',
        choices: []
    },
    {
        id: 'kaede_book_08', category: 'player_holding_book',
        en: 'Good reading, commander! Master the schematics and there isn\'t a machine in this world you can\'t overhaul.',
        vi: 'Đọc kỹ đấy chỉ huy! Nắm vững sơ đồ rồi thì chẳng có cỗ máy nào trên đời này mà cậu không đại tu được cả.',
        choices: []
    },

    // 12. player_drinking (8)
    {
        id: 'kaede_drink_01', category: 'player_drinking',
        en: 'Gulping down that cold beverage! Ah, watching you hydrate makes me want to crack open a cold brew matcha myself!',
        vi: 'Uống ừng ực lon nước lạnh ngon lành ghê! Nhìn cậu uống làm tớ cũng muốn khui ngay một lon matcha lạnh ra uống cùng quá!',
        choices: []
    },
    {
        id: 'kaede_drink_02', category: 'player_drinking',
        en: 'The procedural drinking animation executed cleanly. Grip held firm, can tilted smoothly to mouth level, zero camera glitch!',
        vi: 'Hoạt ảnh uống nước thực thi chuẩn xác ghê. Tay cầm chắc chắn, lon nghiêng mượt mà chạm miệng, góc máy không hề bị giật!',
        choices: []
    },
    {
        id: 'kaede_drink_03', category: 'player_drinking',
        en: 'Drink deep, commander! Liquid replenishment keeps biological processor cores running cool under heavy computational workloads.',
        vi: 'Uống đã đời đi chỉ huy! Tiếp nước đầy đủ giúp các nhân xử lý sinh học luôn mát mẻ dưới tải trọng tính toán nặng nề.',
        choices: []
    },
    {
        id: 'kaede_drink_04', category: 'player_drinking',
        en: 'That had to hit the spot! Nothing beats a cold canned drink after hiking across our 3D terrain.',
        vi: 'Đã khát thật đấy! Không gì sướng bằng một lon nước ướp lạnh sau khi lội bộ qua địa hình 3D của chúng ta.',
        choices: []
    },
    {
        id: 'kaede_drink_05', category: 'player_drinking',
        en: 'Wiped your chin with the back of your glove? Haha, proper field-engineer style! Don\'t let Sakura catch you doing that!',
        vi: 'Lấy mu găng tay quẹt cằm à? Haha, đúng chuẩn tác phong kỹ sư thực địa! Đừng để Sakura bắt quả tang kẻo lại bị cằn nhằn đấy!',
        choices: []
    },
    {
        id: 'kaede_drink_06', category: 'player_drinking',
        en: 'Finished the sip? You look ready to rebuild a combustion engine with your bare hands. Love the energy!',
        vi: 'Uống xong rồi chứ? Trông cậu sung sức như sẵn sàng đại tu cả cái động cơ đốt trong bằng tay không vậy. Mê cái năng lượng này ghê!',
        choices: []
    },
    {
        id: 'kaede_drink_07', category: 'player_drinking',
        en: 'Hydration complete. Coolant fluid levels restored to 100%. Ready for the next high-stress task!',
        vi: 'Nạp nước hoàn tất. Mức dung dịch làm mát đã phục hồi 100%. Sẵn sàng cho nhiệm vụ áp lực cao tiếp theo rồi!',
        choices: []
    },
    {
        id: 'kaede_drink_08', category: 'player_drinking',
        en: 'Remember to crush the can when done. Good recycling habits keep our workshop supplied with pure metal scrap.',
        vi: 'Uống xong nhớ bóp bẹp vỏ lon nhé. Thói quen tái chế tốt giúp xưởng cơ khí của chúng ta luôn có sẵn phế liệu kim loại sạch.',
        choices: []
    },

    // 13. player_using_terminal (8)
    {
        id: 'kaede_terminal_01', category: 'player_using_terminal',
        en: 'Terminal mode engaged! Our Windows ConPTY bridge is humming silently in the background, forwarding I/O with zero friction.',
        vi: 'Đã vào chế độ Terminal! Cầu nối ConPTY trên Windows đang chạy êm ru dưới nền, chuyển tiếp dữ liệu I/O không chút ma sát.',
        choices: []
    },
    {
        id: 'kaede_terminal_02', category: 'player_using_terminal',
        en: 'Look at that command line output streaming past! Pure raw computing power routed straight to your display.',
        vi: 'Nhìn dòng lệnh tuôn trào mượt mà kia xem! Sức mạnh tính toán nguyên bản truyền thẳng về màn hình của cậu.',
        choices: []
    },
    {
        id: 'kaede_terminal_03', category: 'player_using_terminal',
        en: 'Running heavy compilation batches? Let \'em rip! The cooling fans on your host PC have plenty of headroom.',
        vi: 'Đang chạy biên dịch nặng à? Cứ cho chạy tẹt ga đi! Quạt tản nhiệt trên máy chủ ở nhà của cậu còn thừa nhiều công suất lắm.',
        choices: []
    },
    {
        id: 'kaede_terminal_04', category: 'player_using_terminal',
        en: 'I tweaked the terminal font kerning and line-height so you won\'t get eye strain during marathon coding marathons.',
        vi: 'Tớ đã căn chỉnh khoảng cách chữ và chiều cao dòng trên terminal rồi, đảm bảo không bị mỏi mắt khi cày cuốc thâu đêm.',
        choices: []
    },
    {
        id: 'kaede_terminal_05', category: 'player_using_terminal',
        en: 'Focus mode puts the terminal center-stage while parking the 3D rendering loop at reduced draw overhead. Smart power savings!',
        vi: 'Chế độ Focus đưa terminal lên trước và giảm tải vòng lặp dựng hình 3D lại. Tiết kiệm điện năng cực kỳ thông minh luôn!',
        choices: []
    },
    {
        id: 'kaede_terminal_06', category: 'player_using_terminal',
        en: 'Command line power is unmatched. GUIs are pretty, but terminal shells are where real system surgeons operate.',
        vi: 'Sức mạnh dòng lệnh là vô đối. Giao diện đồ họa thì đẹp mắt đấy, nhưng terminal mới là nơi các bác sĩ phẫu thuật hệ thống thực thụ trổ tài.',
        choices: []
    },
    {
        id: 'kaede_terminal_07', category: 'player_using_terminal',
        en: 'Need to capture remote desktop snapshots while in terminal? The tools drawer has automated screenshot utilities ready.',
        vi: 'Cần chụp ảnh màn hình máy tính từ xa khi đang ở terminal à? Ngăn kéo công cụ có sẵn tiện ích chụp ảnh tự động đấy.',
        choices: []
    },
    {
        id: 'kaede_terminal_08', category: 'player_using_terminal',
        en: 'May your exit codes always return zero! Ship those features and make the whole infrastructure proud.',
        vi: 'Chúc mã thoát của cậu luôn là số 0 tròn trĩnh! Hãy tung các tính năng mới ra và làm cả hệ thống phải tự hào.',
        choices: []
    },

    // 14. player_chatting (8)
    {
        id: 'kaede_chat_01', category: 'player_chatting',
        en: 'Firing off messages in MMO chat! The websocket broadcast service is routing packets across the cluster with zero latency.',
        vi: 'Đang bắn tin nhắn ầm ầm trên kênh chat MMO à! Dịch vụ truyền phát websocket đang định tuyến các gói tin qua cụm server với độ trễ bằng 0.',
        choices: []
    },
    {
        id: 'kaede_chat_02', category: 'player_chatting',
        en: 'Sending a private whisper? Use `/m <player>` or hit the reply button directly. Clean, reliable communication pipelines.',
        vi: 'Đang gửi mật thư riêng tư à? Dùng lệnh `/m <tên>` hoặc bấm thẳng vào nút Reply nhé. Đường ống liên lạc gọn gàng và chuẩn xác.',
        choices: []
    },
    {
        id: 'kaede_chat_03', category: 'player_chatting',
        en: 'Look at that 3D chat bubble hovering over your head! The billboarding matrix always keeps it facing the active camera.',
        vi: 'Nhìn bong bóng chat 3D lơ lửng trên đầu cậu kìa! Ma trận billboarding luôn giữ cho nó xoay thẳng về phía camera quan sát.',
        choices: []
    },
    {
        id: 'kaede_chat_04', category: 'player_chatting',
        en: 'If you ever mistype a whisper recipient, hit Escape or tap the banner cancel button to reset the target. Easy fix.',
        vi: 'Nếu có gõ nhầm người nhận mật thư, cứ bấm phím Escape hoặc nút hủy trên dải băng để đặt lại mục tiêu nhé. Quá tiện luôn.',
        choices: []
    },
    {
        id: 'kaede_chat_05', category: 'player_chatting',
        en: 'Coordinating deployments in global chat? Clear communication prevents accidental production collisions!',
        vi: 'Đang phối hợp triển khai trên chat chung à? Giao tiếp rõ ràng sẽ ngăn chặn những vụ đụng độ code thảm họa trên production đấy!',
        choices: []
    },
    {
        id: 'kaede_chat_06', category: 'player_chatting',
        en: 'The chat system uses optimistic UI rendering: your message shows instantly while the server confirms in the background.',
        vi: 'Hệ thống chat dùng cơ chế hiển thị lạc quan (optimistic UI): tin nhắn hiện lên ngay lập tức trong khi server xác thực ngầm bên dưới.',
        choices: []
    },
    {
        id: 'kaede_chat_07', category: 'player_chatting',
        en: 'Chatting with other devs makes this virtual world feel alive. Multiplayer synergy is what turns code into a community.',
        vi: 'Trò chuyện cùng các dev khác làm thế giới ảo này sống động hẳn lên. Sức mạnh nhiều người chơi biến mã nguồn thành một cộng đồng thực thụ.',
        choices: []
    },
    {
        id: 'kaede_chat_08', category: 'player_chatting',
        en: 'Dispatch complete! Close the chat drawer when you\'re ready to resume exploring our open countryside.',
        vi: 'Gửi tin nhắn xong xuôi rồi chứ! Đóng khung chat lại khi cậu sẵn sàng tiếp tục khám phá vùng quê của chúng ta nhé.',
        choices: []
    },

    // 15. location_hub (8)
    {
        id: 'kaede_hub_01', category: 'location_hub',
        en: 'The central hub plaza! I poured reinforced concrete sub-bases under these granite slabs so they never crack under load.',
        vi: 'Quảng trường trung tâm! Tớ đã đổ móng bê tông cốt thép dưới mấy phiến đá hoa cương này nên không bao giờ sợ nứt dưới tải trọng nặng.',
        choices: []
    },
    {
        id: 'kaede_hub_02', category: 'location_hub',
        en: 'This is the main interchange of our world. Heavy power conduits and fiber trunks all converge beneath this circular deck.',
        vi: 'Đây là nút giao thông chính của thế giới chúng ta. Các đường cáp điện nặng và trục cáp quang đều hội tụ dưới sàn tròn này.',
        choices: []
    },
    {
        id: 'kaede_hub_03', category: 'location_hub',
        en: 'Notice the perimeter drainage slots along the plaza edge; even during torrential typhoons, zero standing water pools here.',
        vi: 'Để ý mấy rãnh thoát nước xung quanh mép quảng trường xem; ngay cả trong bão lớn cũng không bao giờ có vũng nước đọng ở đây.',
        choices: []
    },
    {
        id: 'kaede_hub_04', category: 'location_hub',
        en: 'The spawn point coordinates are calibrated to exact spatial precision. Smooth spawn, no collision clipping.',
        vi: 'Tọa độ điểm hồi sinh được hiệu chỉnh với độ chính xác không gian tuyệt đối. Xuất hiện mượt mà, không bị kẹt va chạm.',
        choices: []
    },
    {
        id: 'kaede_hub_05', category: 'location_hub',
        en: 'From here, you have clear sightlines to the bridge, the cherry grove, and the village. Clean spatial planning!',
        vi: 'Từ đây cậu có tầm nhìn thoáng đãng tới cây cầu, đồi hoa anh đào và ngôi làng. Quy hoạch không gian chuẩn chỉ ghê!',
        choices: []
    },
    {
        id: 'kaede_hub_06', category: 'location_hub',
        en: 'The lighting fixtures embedded in the hub rim run on low-voltage DC currents. Energy-efficient and ruggedly built.',
        vi: 'Dàn đèn âm viền quanh quảng trường chạy bằng nguồn điện một chiều DC điện áp thấp. Tiết kiệm điện và siêu bền bỉ.',
        choices: []
    },
    {
        id: 'kaede_hub_07', category: 'location_hub',
        en: 'Whenever you get turned around in the wilderness, head toward the plaza beacon. You can\'t miss it.',
        vi: 'Bất cứ khi nào bị mất phương hướng ngoài đồng hoang, cứ nhắm hướng ngọn hải đăng quảng trường mà đi. Không thể lạc được đâu.',
        choices: []
    },
    {
        id: 'kaede_hub_08', category: 'location_hub',
        en: 'Welcome to ground zero of our operations. Stand firm on this solid foundation, commander!',
        vi: 'Chào mừng về với tổng hành dinh tác chiến. Đứng vững trên nền móng kiên cố này nhé chỉ huy!',
        choices: []
    },

    // 16. location_village (8)
    {
        id: 'kaede_village_01', category: 'location_village',
        en: 'The rustic village square! I helped frame the timber rafters on those wooden houses. Authentic Japanese mortise joints!',
        vi: 'Quảng trường làng mộc mạc! Tớ đã phụ dựng xà gồ gỗ cho mấy nếp nhà kia đấy. Toàn mộng gỗ truyền thống chuẩn chỉ của Nhật!',
        choices: []
    },
    {
        id: 'kaede_village_02', category: 'location_village',
        en: 'Did you check out the vintage bicycle parked by the fence? I tuned its coaster brakes and lubed the chain last Tuesday.',
        vi: 'Cậu đã nghía chiếc xe đạp cổ dựng cạnh hàng rào chưa? Thứ ba tuần trước tớ vừa cân lại phanh và tra dầu xích cho nó đấy.',
        choices: []
    },
    {
        id: 'kaede_village_03', category: 'location_village',
        en: 'Ring the bicycle bell if you want to test the sound engine! It has authentic brass acoustic resonance.',
        vi: 'Rung chuông xe đạp xem nào nếu muốn thử âm thanh! Nó có tiếng chuông đồng vang ngân cực kỳ chân thực đấy.',
        choices: []
    },
    {
        id: 'kaede_village_04', category: 'location_village',
        en: 'The roadside rest stop bench is where the village elders gather to discuss crop rotations and mechanical repairs.',
        vi: 'Chiếc ghế ở trạm dừng chân ven đường là nơi các cụ trong làng hay ngồi bàn chuyện mùa màng và sửa chữa máy nông nghiệp.',
        choices: []
    },
    {
        id: 'kaede_village_05', category: 'location_village',
        en: 'Notice the stone water troughs in the alleys; gravity feeds water continuously from the mountain flume.',
        vi: 'Để ý mấy máng nước bằng đá trong ngõ xem; nước từ máng núi chảy tự nhiên về đây bằng trọng lực liên tục đấy.',
        choices: []
    },
    {
        id: 'kaede_village_06', category: 'location_village',
        en: 'The timber buildings have cedar eaves angled to deflect snow in winter and shed monsoon rain in summer.',
        vi: 'Những ngôi nhà gỗ có mái hiên tuyết tùng nghiêng vừa đủ để gạt tuyết mùa đông và thoát nước mưa rào mùa hè.',
        choices: []
    },
    {
        id: 'kaede_village_07', category: 'location_village',
        en: 'Village life is peaceful, but beneath the quiet surface, our automated backup scripts run on rigorous cron timers.',
        vi: 'Cuộc sống làng quê thanh bình thật, nhưng dưới vẻ tĩnh lặng ấy, các script sao lưu tự động vẫn chạy chuẩn theo lịch cron nghiêm ngặt.',
        choices: []
    },
    {
        id: 'kaede_village_08', category: 'location_village',
        en: 'Take a stroll through the village lanes. It\'s a great reminder that technology exists to serve human peace of mind.',
        vi: 'Dạo một vòng qua những con ngõ trong làng đi. Đó là lời nhắc nhở tuyệt vời rằng công nghệ tồn tại là để phục vụ sự an tâm của con người.',
        choices: []
    },

    // 17. location_rice_field (8)
    {
        id: 'kaede_rice_01', category: 'location_rice_field',
        en: 'The stepped rice terraces! That terraced layout is basically a multi-stage gravity-fed hydraulic cooling matrix!',
        vi: 'Những thửa ruộng bậc thang! Bố cục giật cấp đó về cơ bản là một ma trận tản nhiệt thủy lực phân tầng chảy bằng trọng lực đấy!',
        choices: []
    },
    {
        id: 'kaede_rice_02', category: 'location_rice_field',
        en: 'The earthen bunds separating the flooded plots are packed hard with clay. Firm footing, but watch out for wet spots!',
        vi: 'Những bờ ruộng đất ngăn giữa các ô nước được đầm chặt bằng đất sét. Chân bước vững đấy, nhưng nhớ tránh mấy chỗ bùn nhão nhé!',
        choices: []
    },
    {
        id: 'kaede_rice_03', category: 'location_rice_field',
        en: 'Each step drops about 0.8 meters. The water sluice gates allow farmers to tune the flow rates with wooden pegs.',
        vi: 'Mỗi bậc ruộng chênh nhau khoảng 0.8 mét. Các cửa phai cống cho phép bà con điều chỉnh lưu lượng nước bằng chốt gỗ.',
        choices: []
    },
    {
        id: 'kaede_rice_04', category: 'location_rice_field',
        en: 'The flooded water reflects the clouds like a multi-monitor mirror setup. Nature\'s own wide-aspect display!',
        vi: 'Mặt nước ngập phản chiếu mây trời hệt như một dàn màn hình gương ghép đa màn hình. Màn hình góc rộng tự nhiên của tạo hóa!',
        choices: []
    },
    {
        id: 'kaede_rice_05', category: 'location_rice_field',
        en: 'Don\'t go dropping heavy toolkits into the mud! Digging up dropped wrenches from wet clay is no picnic, trust me.',
        vi: 'Đừng có làm rơi hộp đồ nghề nặng xuống bùn đấy nhé! Mò cờ-lê dưới bùn lầy không vui vẻ gì đâu, tin tớ đi.',
        choices: []
    },
    {
        id: 'kaede_rice_06', category: 'location_rice_field',
        en: 'The rich organic soil here produces top-grade short-grain rice. Best staple food for fueling long coding marathons.',
        vi: 'Đất phù sa màu mỡ nơi đây cho ra loại gạo hạt tròn hảo hạng. Lương thực tuyệt nhất để tiếp sức cho những cuộc cày code kéo dài.',
        choices: []
    },
    {
        id: 'kaede_rice_07', category: 'location_rice_field',
        en: 'Listen to the water gurgling through the bamboo flumes. Passive engineering that requires zero kilowatt-hours to operate.',
        vi: 'Lắng nghe tiếng nước róc rách qua các máng tre xem. Kỹ thuật thụ động thông minh không tốn lấy một kilowatt điện nào để vận hành.',
        choices: []
    },
    {
        id: 'kaede_rice_08', category: 'location_rice_field',
        en: 'The terraces stretch all the way down to the river valley. Remarkable civil engineering by the local settlers.',
        vi: 'Những thửa ruộng bậc thang trải dài xuống tận thung lũng ven sông. Công trình thủy lợi đáng kinh ngạc của người dân địa phương.',
        choices: []
    },

    // 18. location_river (8)
    {
        id: 'kaede_river_01', category: 'location_river',
        en: 'The meandering river! That water flow is the ultimate natural liquid-cooling loop for the whole valley ecosystem.',
        vi: 'Dòng sông uốn lượn! Dòng chảy đó chính là vòng tản nhiệt nước tự nhiên đỉnh cao cho toàn bộ hệ sinh thái thung lũng này.',
        choices: []
    },
    {
        id: 'kaede_river_02', category: 'location_river',
        en: 'Stay out of the deep river channel! Our pathfinding system is hardcoded to prevent NPCs from wading into the water.',
        vi: 'Đừng có lội xuống lòng sông sâu nhé! Hệ thống tìm đường của chúng ta được lập trình nghiêm ngặt cấm NPC lội bừa xuống nước đấy.',
        choices: []
    },
    {
        id: 'kaede_river_03', category: 'location_river',
        en: 'Look at the riverside campfire site: dry kindling, river stone fire ring, and a steady supply of firewood.',
        vi: 'Nhìn khu lửa trại bên bờ sông xem: bùi nhùi khô, vòng đá cuội chắn lửa và đống củi khô được xếp gọn gàng.',
        choices: []
    },
    {
        id: 'kaede_river_04', category: 'location_river',
        en: 'The riverbed stones are rounded and smooth from centuries of hydrodynamic friction. Nature is a patient machinist.',
        vi: 'Đá dưới lòng sông tròn nhẵn thín sau hàng thế kỷ bị ma sát thủy động lực học mài giũa. Tự nhiên chính là một thợ tiện kiên nhẫn nhất.',
        choices: []
    },
    {
        id: 'kaede_river_05', category: 'location_river',
        en: 'There\'s a solid cedar bench right here by the river bank. Pull up a seat and let the water sounds wash away your fatigue.',
        vi: 'Có chiếc ghế tuyết tùng vững chãi ngay đây bên bờ sông này. Ngồi xuống đi và để tiếng nước cuốn trôi mọi mỏi mệt trong người.',
        choices: []
    },
    {
        id: 'kaede_river_06', category: 'location_river',
        en: 'The water surface shader uses real-time normal maps and Fresnel reflection math. Looks crystal clear and physically based!',
        vi: 'Bộ shader mặt nước dùng bản đồ pháp tuyến (normal map) thời gian thực và công thức phản xạ Fresnel. Nhìn trong vắt chuẩn PBR!',
        choices: []
    },
    {
        id: 'kaede_river_07', category: 'location_river',
        en: 'The river flow follows a mathematical sin curve across the world grid. Smooth sinusoidal meandering at its best.',
        vi: 'Dòng sông uốn khúc theo đường cong sin toán học trên lưới bản đồ. Dòng chảy lượn sóng mềm mại không tì vết.',
        choices: []
    },
    {
        id: 'kaede_river_08', category: 'location_river',
        en: 'If you follow the river current downstream, it heads straight toward the southern coast and the fishing pier.',
        vi: 'Cứ đi xuôi theo dòng chảy của con sông này là nó sẽ dẫn thẳng ra bờ biển phía nam và cây cầu tàu đánh cá đấy.',
        choices: []
    },

    // 19. location_bridge (8)
    {
        id: 'kaede_bridge_01', category: 'location_bridge',
        en: 'The arched timber bridge! My proudest structural masterpiece! Parabolic arch, laminated cedar beams, zero metal screws in the arch!',
        vi: 'Cây cầu vòm gỗ! Kiệt tác kết cấu mà tớ tự hào nhất! Vòm cong parabol, dầm tuyết tùng ghép lớp, không dùng một con ốc kim loại nào trong vòm!',
        choices: []
    },
    {
        id: 'kaede_bridge_02', category: 'location_bridge',
        en: 'Notice how the deck height curves up to peak at `py = sin(t * PI) * 0.68 + 0.24`. Perfect parabolic elevation math!',
        vi: 'Để ý độ cao mặt cầu vồng lên đạt đỉnh ở công thức `py = sin(t * PI) * 0.68 + 0.24` xem. Toán học độ cao parabol chuẩn từng ly!',
        choices: []
    },
    {
        id: 'kaede_bridge_03', category: 'location_bridge',
        en: 'All bridge abutments are anchored into solid bedrock on both shores. This baby can withstand category 5 earthquakes.',
        vi: 'Mọi mố cầu đều được ngàm chặt vào nền đá mẹ ở cả hai bờ. Công trình này chịu được cả động đất cấp 5 luôn đấy.',
        choices: []
    },
    {
        id: 'kaede_bridge_04', category: 'location_bridge',
        en: 'Stand on the bridge crest and look down at the river rapids! You get an unobstructed view of both north and south banks.',
        vi: 'Đứng trên đỉnh vòm cầu nhìn xuống dòng nước xiết xem! Cậu có tầm nhìn thoáng đãng bao quát cả hai bờ bắc và nam luôn.',
        choices: []
    },
    {
        id: 'kaede_bridge_05', category: 'location_bridge',
        en: 'All NPC navigation paths across the river are routed across this bridge deck. Clean waypoints, no river wading bugs.',
        vi: 'Mọi đường đi của NPC qua sông đều được định tuyến đi qua mặt cầu này. Các điểm nút rõ ràng, không bao giờ có lỗi lội nước ngớ ngẩn.',
        choices: []
    },
    {
        id: 'kaede_bridge_06', category: 'location_bridge',
        en: 'I hand-planed the cedar handrails so travelers could lean against them comfortably without scratching their palms.',
        vi: 'Tớ đã đích thân bào nhẵn tay vịn tuyết tùng để người đi đường có thể tựa vào thoải mái mà không bị xước tay.',
        choices: []
    },
    {
        id: 'kaede_bridge_07', category: 'location_bridge',
        en: 'Listen to the solid thud under your boots as you cross. That\'s the sound of heavy timber handling your weight with ease.',
        vi: 'Nghe tiếng bước chân nện chắc nịch dưới đế giày khi băng qua cầu không. Đó là âm thanh của gỗ khối chịu lực dễ dàng nâng bước cậu đấy.',
        choices: []
    },
    {
        id: 'kaede_bridge_08', category: 'location_bridge',
        en: 'Connecting two isolated shores with a single elegant timber arch... That\'s why I became an engineer in the first place.',
        vi: 'Nối liền hai bờ cách trở bằng một nhịp cầu gỗ thanh nhã duy nhất... Đó chính là lý do đầu tiên thôi thúc tớ trở thành kỹ sư đấy.',
        choices: []
    },

    // 20. location_cherry_grove (8)
    {
        id: 'kaede_cherry_01', category: 'location_cherry_grove',
        en: 'The cherry blossom hill! Petals are fluttering everywhere! Make sure they don\'t clog up your cooling fan grilles!',
        vi: 'Đồi hoa anh đào! Cánh hoa bay rợp trời kìa! Cẩn thận đừng để cánh hoa lọt vào làm kẹt lưới quạt tản nhiệt của cậu nhé!',
        choices: []
    },
    {
        id: 'kaede_cherry_02', category: 'location_cherry_grove',
        en: 'Sakura takes care of this grove like a protective lioness. Don\'t you dare break any branches while testing your sword swings!',
        vi: 'Sakura chăm chút cho vườn hoa này như sư tử bảo vệ con vậy. Cấm cậu vung kiếm thử mà làm gãy cành cây nào đấy nhé!',
        choices: []
    },
    {
        id: 'kaede_cherry_03', category: 'location_cherry_grove',
        en: 'The bench under the big sakura tree has an awesome panoramic angle over the river valley. Great spot for lunch breaks.',
        vi: 'Chiếc ghế dưới gốc anh đào to có góc ngắm toàn cảnh thung lũng sông tuyệt đẹp. Nơi lý tưởng để ngồi ăn trưa nghỉ ngơi.',
        choices: []
    },
    {
        id: 'kaede_cherry_04', category: 'location_cherry_grove',
        en: 'I engineered the soil retaining wall on this hill so rainfall runoff doesn\'t cause mudslides onto the road below.',
        vi: 'Tớ đã thiết kế kè đá giữ đất trên sườn đồi này để nước mưa không làm xói mòn sạt lở xuống con đường bên dưới đấy.',
        choices: []
    },
    {
        id: 'kaede_cherry_05', category: 'location_cherry_grove',
        en: 'The pink blossom color contrasts nicely against my emerald green work jacket. Even a mechanic appreciates good color matching.',
        vi: 'Sắc hoa hồng phấn tương phản rất đẹp với áo khoác thợ màu xanh ngọc lục bảo của tớ. Thợ cơ khí cũng biết phối màu thẩm mỹ phết đấy chứ.',
        choices: []
    },
    {
        id: 'kaede_cherry_06', category: 'location_cherry_grove',
        en: 'The spring breeze blowing through these trees creates natural pink confetti. Pure anime movie magic in real 3D!',
        vi: 'Gió xuân thổi qua rặng cây tạo nên cơn mưa pháo hoa màu hồng tự nhiên. Phép thuật phim anime đích thực trên nền 3D sống động!',
        choices: []
    },
    {
        id: 'kaede_cherry_07', category: 'location_cherry_grove',
        en: 'Take a seat on the bench and rest your boots. You\'ve been on the move all afternoon.',
        vi: 'Ngồi xuống chiếc ghế nghỉ chân đi. Cậu đã đi lại lặn lội suốt cả buổi chiều rồi đấy.',
        choices: []
    },
    {
        id: 'kaede_cherry_08', category: 'location_cherry_grove',
        en: 'Blossoms bloom and fade every spring, but good structural code lasts for decades. Keep building strong, commander!',
        vi: 'Hoa nở rồi tàn mỗi độ xuân về, nhưng mã nguồn kết cấu tốt sẽ trường tồn hàng thập kỷ. Hãy luôn xây dựng vững chắc nhé chỉ huy!',
        choices: []
    },

    // 21. location_mountain (8)
    {
        id: 'kaede_mountain_01', category: 'location_mountain',
        en: 'The alpine mountain ridge! Up here at high altitude, atmospheric pressure drops and air cooling efficiency shifts!',
        vi: 'Rặng núi cao tuyết phủ! Lên tới độ cao này, áp suất khí quyển giảm đi và hiệu suất tản nhiệt không khí thay đổi rõ rệt luôn!',
        choices: []
    },
    {
        id: 'kaede_mountain_02', category: 'location_mountain',
        en: 'Look at those snow-capped peaks in the background! Multi-layered distant terrain with atmospheric depth fog. Crisp rendering!',
        vi: 'Nhìn những đỉnh núi tuyết phía sau kìa! Địa hình xa đa tầng kết hợp sương mù chiều sâu khí quyển. Dựng hình nét căng!',
        choices: []
    },
    {
        id: 'kaede_mountain_03', category: 'location_mountain',
        en: 'The wind up on this ridge is intense! I had to bolt that panorama bench down with four heavy steel anchor rods.',
        vi: 'Gió trên triền núi này thổi rát thật! Tớ đã phải bắt chết chiếc ghế ngắm cảnh đó xuống đá bằng bốn thanh neo thép dày cộp đấy.',
        choices: []
    },
    {
        id: 'kaede_mountain_04', category: 'location_mountain',
        en: 'From this vantage point, you can inspect the layout of every single subsystem across the entire island.',
        vi: 'Từ điểm quan sát này, cậu có thể bao quát toàn bộ bố cục của từng phân hệ trên khắp hòn đảo.',
        choices: []
    },
    {
        id: 'kaede_mountain_05', category: 'location_mountain',
        en: 'The air is crisp, dry, and clean. No dust, no smog—ideal conditions for testing optical transmission sensors.',
        vi: 'Không khí se lạnh, khô ráo và sạch bong. Không bụi bặm, không khói mờ—điều kiện lý tưởng để thử nghiệm cảm biến quang học.',
        choices: []
    },
    {
        id: 'kaede_mountain_06', category: 'location_mountain',
        en: 'Sit upon the hilltop panorama bench and look out at the world. You climbed all the way up here; savor the summit!',
        vi: 'Ngồi lên chiếc ghế ngắm toàn cảnh đỉnh đồi mà phóng mắt ngắm thế giới đi. Cậu đã leo một mạch lên tận đây; hãy tận hưởng đỉnh cao!',
        choices: []
    },
    {
        id: 'kaede_mountain_07', category: 'location_mountain',
        en: 'The granite bedrock up here is billions of years old. Mother Nature\'s ultimate stress-tested material.',
        vi: 'Nền đá hoa cương trên này đã hàng tỷ năm tuổi rồi. Vật liệu chịu lực đỉnh cao đã qua bài test khắc nghiệt nhất của Mẹ Thiên Nhiên.',
        choices: []
    },
    {
        id: 'kaede_mountain_08', category: 'location_mountain',
        en: 'Standing on the crest beside you feels awesome, commander! High altitude and high ambitions go hand in hand.',
        vi: 'Đứng trên đỉnh núi cạnh cậu cảm giác đã thật đấy, chỉ huy! Tầm cao của ngọn núi và tầm nhìn của hoài bão luôn đồng hành cùng nhau.',
        choices: []
    },

    // 22. location_beach (8)
    {
        id: 'kaede_beach_01', category: 'location_beach',
        en: 'The sandy coastal beach! Watch out for salt spray on your metal gear—marine corrosion is an engineer\'s worst enemy!',
        vi: 'Bãi biển cát duyên hải! Coi chừng bụi muối biển bám vào đồ kim loại nhé—ăn mòn nước mặn là kẻ thù số một của dân cơ khí đấy!',
        choices: []
    },
    {
        id: 'kaede_beach_02', category: 'location_beach',
        en: 'The fine sand shifts beneath your boots. It\'s basically silica crystals ground down by millions of ocean wave cycles.',
        vi: 'Cát mịn lún dưới đế giày. Nó chính là các tinh thể silica bị nghiền nhỏ sau hàng triệu chu kỳ sóng biển đập vào đấy.',
        choices: []
    },
    {
        id: 'kaede_beach_03', category: 'location_beach',
        en: 'There\'s a shaded bench right under that beach umbrella. Sit down and let the sea breeze cool your radiators.',
        vi: 'Có chiếc ghế râm mát ngay dưới cây dù bãi biển kia. Ngồi xuống đi và để gió biển làm mát các phiến tản nhiệt của cậu.',
        choices: []
    },
    {
        id: 'kaede_beach_04', category: 'location_beach',
        en: 'Listen to the rhythmic roar of the incoming surf. Nature\'s own low-frequency subwoofer operating around 30 Hertz.',
        vi: 'Lắng nghe tiếng sóng vỗ rì rào theo nhịp điệu. Loa siêu trầm tần số thấp tự nhiên của tạo hóa đang đánh ở khoảng 30 Hertz đấy.',
        choices: []
    },
    {
        id: 'kaede_beach_05', category: 'location_beach',
        en: 'The water surface meets the sand with a smooth wave foam shader. Zero harsh rendering seam along the tide line.',
        vi: 'Mặt nước tiếp giáp với bờ cát bằng bộ shader bọt sóng mượt mà. Không hề có vết cắt răng cưa thô thiển nào dọc mép nước.',
        choices: []
    },
    {
        id: 'kaede_beach_06', category: 'location_beach',
        en: 'I coated the umbrella frame with marine-grade anti-rust primer. That brass pole won\'t corrode for at least twenty years!',
        vi: 'Tớ đã sơn lót chống gỉ hàng hải cho khung dù rồi. Cái cán đồng thau đó sẽ không bị gỉ sét trong ít nhất hai mươi năm tới!',
        choices: []
    },
    {
        id: 'kaede_beach_07', category: 'location_beach',
        en: 'The open horizon stretches endlessly toward the south. Makes you want to build a motorized catamaran and go exploring!',
        vi: 'Đường chân trời mở rộng bao la về phía nam. Nhìn chỉ muốn đóng ngay một chiếc ca-nô hai thân gắn máy để phi ra khơi khám phá!',
        choices: []
    },
    {
        id: 'kaede_beach_08', category: 'location_beach',
        en: 'Kick back and relax on the sand, commander. Even the toughest field engineers need beach time to recharge.',
        vi: 'Tựa lưng thư giãn trên bãi cát đi chỉ huy. Đến cả những kỹ sư thực địa rắn rỏi nhất cũng cần thời gian đi biển để sạc lại năng lượng.',
        choices: []
    },

    // 23. location_pier (8)
    {
        id: 'kaede_pier_01', category: 'location_pier',
        en: 'The rustic wooden fishing pier! Walk straight down the center planks—I reinforced every single supporting pile with treated timber!',
        vi: 'Cầu tàu đánh cá mộc mạc! Đi thẳng vào các tấm ván giữa nhé—tớ đã gia cố từng cọc trụ đỡ bằng gỗ ngâm tẩm hóa chất chống mục rồi!',
        choices: []
    },
    {
        id: 'kaede_pier_02', category: 'location_pier',
        en: 'Notice the surface elevation: the pier walkway sits at a walkable height of 0.20 meters above the sea surface. Perfect clearance!',
        vi: 'Để ý độ cao mặt sàn xem: lối đi cầu tàu nằm ở độ cao đi bộ 0.20 mét trên mặt biển. Khoảng hở an toàn tuyệt đối luôn!',
        choices: []
    },
    {
        id: 'kaede_pier_03', category: 'location_pier',
        en: 'Hear the wood creak under your boots? Our surface detector identifies `wood_pier` with authentic creaking audio params.',
        vi: 'Nghe tiếng gỗ cọt kẹt dưới chân không? Bộ nhận diện bề mặt ghi nhận chuẩn loại `wood_pier` với thông số âm thanh cọt kẹt chân thực.',
        choices: []
    },
    {
        id: 'kaede_pier_04', category: 'location_pier',
        en: 'Out here at the pierhead, you\'re surrounded by water on three sides! Outstanding marine panorama.',
        vi: 'Ra tận đầu cầu tàu này, ba bề đều là nước biển ôm trọn! Cảnh quan hàng hải đỉnh cao không góc chết.',
        choices: []
    },
    {
        id: 'kaede_pier_05', category: 'location_pier',
        en: 'The bench at the pierhead is anchored with marine brass brackets. Sit down and watch the tide roll in.',
        vi: 'Chiếc ghế ở đầu cầu tàu được bắt chặt bằng giá đỡ đồng thau chịu mặn. Ngồi xuống và ngắm từng đợt thủy triều dâng lên nào.',
        choices: []
    },
    {
        id: 'kaede_pier_06', category: 'location_pier',
        en: 'The tide slapping against the pilings provides natural structural damping against wave sway. Robust marine carpentry!',
        vi: 'Từng đợt sóng vỗ vào cọc trụ tạo nên độ giảm chấn kết cấu tự nhiên chống rung lắc mặt sàn. Nghề mộc hàng hải vững chắc thật!',
        choices: []
    },
    {
        id: 'kaede_pier_07', category: 'location_pier',
        en: 'Be careful not to drop any metal tools between the plank gaps! Diving in the deep ocean to retrieve a spanner is freezing cold!',
        vi: 'Cẩn thận đừng làm rơi dụng cụ kim loại lọt qua khe ván nhé! Lặn xuống biển sâu mò cờ-lê lạnh buốt thấu xương đấy!',
        choices: []
    },
    {
        id: 'kaede_pier_08', category: 'location_pier',
        en: 'Look at the endless blue horizon. A sturdy wooden pier reaching into the ocean: human engineering greeting the wild sea.',
        vi: 'Nhìn chân trời xanh thẳm vô tận xem. Một cây cầu tàu gỗ kiên cố vươn mình ra biển: kỹ thuật con người chào đón đại dương bao la.',
        choices: []
    },

    // 24. high_rank (8)
    {
        id: 'kaede_rank_01', category: 'high_rank',
        en: 'Salute to the Master Architect! Commander, your high-level badge is shining like a freshly buffed titanium plate!',
        vi: 'Nghiêm mình chào Bậc Thầy Kiến Trúc! Chỉ huy ơi, huy hiệu cấp cao của cậu đang sáng lóa như tấm kim loại titan vừa được đánh bóng vậy!',
        choices: []
    },
    {
        id: 'kaede_rank_02', category: 'high_rank',
        en: 'Grinding up to that rank takes serious engineering grit. You\'ve proven you can handle the heaviest production workloads.',
        vi: 'Cày cuốc lên được cấp bậc đó đòi hỏi bản lĩnh kỹ sư lì lợm thực sự. Cậu đã chứng minh mình gánh được những dự án nặng nề nhất.',
        choices: []
    },
    {
        id: 'kaede_rank_03', category: 'high_rank',
        en: 'Your overhead rank badge has a custom golden vector insignia! It marks you as a certified heavy-machinery commander.',
        vi: 'Huy hiệu cấp bậc trên đầu cậu có biểu tượng vector vàng kim đặc biệt! Đánh dấu cậu là người chỉ huy cơ giới hạng nặng được chứng nhận.',
        choices: []
    },
    {
        id: 'kaede_rank_04', category: 'high_rank',
        en: 'With that high authority, you can green-light major infrastructural overhauls. Let\'s upgrade the whole server cluster!',
        vi: 'Với quyền hạn cấp cao đó, cậu có thể bật đèn xanh cho những đợt đại tu hạ tầng lớn. Nâng cấp toàn bộ cụm máy chủ thôi nào!',
        choices: []
    },
    {
        id: 'kaede_rank_05', category: 'high_rank',
        en: 'Even with all that prestige, you still come hang out by the workshop. You\'re a real down-to-earth leader, commander.',
        vi: 'Dù ở vị thế lẫy lừng thế, cậu vẫn ghé qua xưởng cơ khí tán gẫu. Cậu đúng là một người thủ lĩnh thực tế và gần gũi, chỉ huy à.',
        choices: []
    },
    {
        id: 'kaede_rank_06', category: 'high_rank',
        en: 'I\'d trust your architectural judgment on any bridge or server configuration. You know your mechanics inside out.',
        vi: 'Tớ tin tưởng tuyệt đối vào phán đoán kiến trúc của cậu trên bất kỳ cây cầu hay cấu hình máy chủ nào. Cậu hiểu rõ từng ngóc ngách.',
        choices: []
    },
    {
        id: 'kaede_rank_07', category: 'high_rank',
        en: 'Keep leading by example! When junior developers see a master who understands low-level hardware, they learn true craft.',
        vi: 'Hãy tiếp tục làm gương nhé! Khi các dev trẻ thấy một bậc thầy am hiểu tận tường phần cứng cấp thấp, họ sẽ học được tay nghề đích thực.',
        choices: []
    },
    {
        id: 'kaede_rank_08', category: 'high_rank',
        en: 'To the high summit! Here\'s to zero downtime, infinite scalability, and flawless engineering execution under your watch!',
        vi: 'Hướng tới những đỉnh cao mới! Chúc cho hệ thống không bao giờ sập, mở rộng vô hạn và kỹ thuật hoàn hảo dưới sự dẫn dắt của cậu!',
        choices: []
    },

    // 25. low_level (8)
    {
        id: 'kaede_level_01', category: 'low_level',
        en: 'Welcome aboard, rookie engineer! Don\'t sweat that Novice title; I started out stripping screw heads on lawnmower engines!',
        vi: 'Chào mừng gia nhập đội ngũ, tân binh kỹ sư! Đừng bận tâm danh hiệu Tập Sự; hồi mới vào nghề tớ cũng toàn làm toét đầu ốc động cơ máy cắt cỏ thôi!',
        choices: []
    },
    {
        id: 'kaede_level_02', category: 'low_level',
        en: 'First rule of the workshop: if something doesn\'t work, don\'t force it with a bigger hammer! Inspect the schematics first.',
        vi: 'Quy tắc số một của xưởng máy: nếu thứ gì không chạy, đừng cố dùng búa to hơn để đập! Hãy kiểm tra lại sơ đồ bản vẽ trước đã.',
        choices: []
    },
    {
        id: 'kaede_level_03', category: 'low_level',
        en: 'Every master was once an apprentice who made mistakes and learned how to fix \'em. Keep your chin up and keep tinkering!',
        vi: 'Mọi bậc thầy đều từng là người học việc mắc sai lầm rồi tự tay sửa chữa. Cứ tự tin ngẩng cao đầu và tiếp tục mày mò nhé!',
        choices: []
    },
    {
        id: 'kaede_level_04', category: 'low_level',
        en: 'Your level will climb fast once you start submitting real pull requests. Experience points come from real mileage on the road.',
        vi: 'Cấp độ của cậu sẽ tăng vèo vèo một khi cậu bắt đầu gửi những pull request thực chiến. Điểm kinh nghiệm đến từ quãng đường thực tế cậu đã đi.',
        choices: []
    },
    {
        id: 'kaede_level_05', category: 'low_level',
        en: 'Need any tools or tips on debugging? Come find me anytime. The workshop is always open for newcomers eager to learn.',
        vi: 'Cần dụng cụ hay mẹo gỡ lỗi gì thì cứ tìm tớ bất cứ lúc nào. Cửa xưởng luôn rộng mở chào đón những người mới ham học hỏi.',
        choices: []
    },
    {
        id: 'kaede_level_06', category: 'low_level',
        en: 'Don\'t be afraid to take things apart to see how they work. Reverse-engineering is the fastest school of practical knowledge.',
        vi: 'Đừng sợ tháo tung mọi thứ ra để xem chúng hoạt động thế nào. Dịch ngược kỹ thuật (reverse-engineering) là trường học nhanh nhất về kiến thức thực tiễn.',
        choices: []
    },
    {
        id: 'kaede_level_07', category: 'low_level',
        en: 'Wear that Lv.1 badge with pride! The best adventures start at the very beginning of the skill tree.',
        vi: 'Hãy đeo tấm huy hiệu Cấp 1 đó với niềm tự hào! Những chuyến phiêu lưu tuyệt nhất luôn bắt đầu từ điểm khởi đầu của cây kỹ năng.',
        choices: []
    },
    {
        id: 'kaede_level_08', category: 'low_level',
        en: 'You\'ve got the spark of a real builder in your eyes. Keep pushing, rookie, you\'re going to build great things!',
        vi: 'Tớ thấy ánh lửa của một người kiến tạo thực thụ trong mắt cậu. Cố lên nhé tân binh, cậu sẽ làm nên những điều vĩ đại!',
        choices: []
    },

    // 26. wind_weather (8)
    {
        id: 'kaede_wind_01', category: 'wind_weather',
        en: 'Feel that spring gust? Testing structural wind loads on buildings is a standard engineering procedure!',
        vi: 'Cảm nhận cơn gió xuân giật chưa? Kiểm tra tải trọng gió trên các công trình là quy trình kỹ thuật tiêu chuẩn đấy!',
        choices: []
    },
    {
        id: 'kaede_wind_02', category: 'wind_weather',
        en: 'The intermittent soft wind audio rebalancing sounds so crisp now. Master volume and ambiance sliders scale it smoothly.',
        vi: 'Cân bằng âm thanh gió nhẹ ngắt quãng nghe nét căng rồi. Các thanh trượt âm lượng tổng và môi trường điều chỉnh mượt mà lắm.',
        choices: []
    },
    {
        id: 'kaede_wind_03', category: 'wind_weather',
        en: 'The wind is turning the village weather vane like crazy! High torque on the brass bearings today.',
        vi: 'Gió đang làm con gà quay chỉ hướng trên mái nhà quay tít mù kìa! Mô-men xoắn trên ổ bi đồng thau hôm nay cao phết.',
        choices: []
    },
    {
        id: 'kaede_wind_04', category: 'wind_weather',
        en: 'A good breeze cools down outdoor electronic enclosures naturally. Free passive convective heat dissipation!',
        vi: 'Một làn gió mát mẻ giúp hạ nhiệt các tủ điện ngoài trời một cách tự nhiên. Giải nhiệt đối lưu thụ động miễn phí luôn!',
        choices: []
    },
    {
        id: 'kaede_wind_05', category: 'wind_weather',
        en: 'Hold onto your blueprints! A sudden 25-knot gust will scatter loose pages across the entire rice terrace valley!',
        vi: 'Giữ chặt mấy tờ bản vẽ đấy! Một cơn gió giật 25 hải lý/giờ là thổi bay giấy tờ tứ tung khắp thung lũng ruộng bậc thang bây giờ!',
        choices: []
    },
    {
        id: 'kaede_wind_06', category: 'wind_weather',
        en: 'The tree branches sway naturally in the wind. Procedural vertex shader wind animation adds so much life to the scene.',
        vi: 'Cành cây đung đưa tự nhiên trong gió. Hoạt ảnh gió bằng vertex shader tự động tăng thêm biết bao sức sống cho khung cảnh.',
        choices: []
    },
    {
        id: 'kaede_wind_07', category: 'wind_weather',
        en: 'Smell that cedar fragrance carried on the wind? Pine resin and clean mountain air—best air filter in the world.',
        vi: 'Ngửi thấy mùi gỗ tuyết tùng thơm ngát bay theo gió không? Nhựa thông và không khí núi rừng thanh sạch—bộ lọc khí tốt nhất trần đời.',
        choices: []
    },
    {
        id: 'kaede_wind_08', category: 'wind_weather',
        en: 'A brisk breeze puts iron in your blood and speed in your stride. Let\'s make progress while the weather is prime!',
        vi: 'Một làn gió trong lành tiếp thêm sinh lực cho máu và tiếp thêm tốc độ cho bước chân. Tranh thủ thời tiết đẹp để tiến bước thôi nào!',
        choices: []
    },

    // 27. farewell (8)
    {
        id: 'kaede_farewell_01', category: 'farewell',
        en: 'Heading out, commander? Alright! I\'ll keep the engines warm and the server processes humming until you return.',
        vi: 'Lên đường hả chỉ huy? Được thôi! Tớ sẽ giữ cho động cơ luôn ấm và các tiến trình server chạy êm ru cho đến khi cậu trở lại.',
        choices: []
    },
    {
        id: 'kaede_farewell_02', category: 'farewell',
        en: 'Don\'t forget to shut down your local debug sessions properly so you don\'t drain your host laptop battery overnight!',
        vi: 'Nhớ tắt mấy phiên debug cục bộ cho đúng quy trình kẻo ngốn sạch pin laptop ở nhà qua đêm đấy nhé!',
        choices: []
    },
    {
        id: 'kaede_farewell_03', category: 'farewell',
        en: 'Catch you on the flip side, pal. The 24/7 host anti-sleep watchdog has your back while you\'re offline.',
        vi: 'Hẹn gặp lại sau nhé bạn hiền. Tiến trình chống ngủ gật 24/7 trên máy chủ sẽ luôn bảo bọc cậu trong lúc cậu offline.',
        choices: []
    },
    {
        id: 'kaede_farewell_04', category: 'farewell',
        en: 'Take care on the road home. Get some solid shut-eye and don\'t stay up coding until 4 AM again!',
        vi: 'Đi đường về cẩn thận nhé. Nhớ ngủ một giấc thật ngon và cấm có thức cày code đến 4 giờ sáng nữa đấy!',
        choices: []
    },
    {
        id: 'kaede_farewell_05', category: 'farewell',
        en: 'I\'ll finish bolting down this timber bridge railing while you\'re away. It\'ll be rock-solid by your next login.',
        vi: 'Tớ sẽ tranh thủ bắt chặt nốt mấy thanh lan can cầu gỗ này trong lúc cậu đi vắng. Đảm bảo lần tới cậu vào là nó vững như bàn thạch.',
        choices: []
    },
    {
        id: 'kaede_farewell_06', category: 'farewell',
        en: 'See ya, buddy! Keep your tools sharp, your thermals low, and your spirits high!',
        vi: 'Hẹn gặp lại nhé bạn tốt! Luôn giữ dụng cụ sắc bén, nhiệt độ máy mát mẻ và tinh thần thật hăng say nhé!',
        choices: []
    },
    {
        id: 'kaede_farewell_07', category: 'farewell',
        en: 'Whenever you need a wrench or a sounding board, you know where to find me. Workshop lights are always on.',
        vi: 'Bất cứ khi nào cần cờ-lê hay cần người bàn luận ý tưởng, cậu biết tìm tớ ở đâu rồi đấy. Đèn xưởng máy luôn sáng.',
        choices: []
    },
    {
        id: 'kaede_farewell_08', category: 'farewell',
        en: 'Over and out, commander! Safe travels through the matrix until our next connection!',
        vi: 'Hết phiên liên lạc, chỉ huy! Chúc cậu có những chuyến du hành an toàn qua ma trận cho đến lần kết nối tiếp theo!',
        choices: []
    }
];

module.exports = { kaedeLines };
