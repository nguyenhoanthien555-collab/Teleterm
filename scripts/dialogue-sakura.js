/**
 * SAKURA DIALOGUE DATASET (216 Lines across 27 Categories)
 * Personality: Tsundere, feisty, sharp UI perfectionist & Systems Guardian
 */

const sakuraLines = [
    // 1. greeting (8)
    {
        id: 'sakura_greeting_01', category: 'greeting',
        en: 'Hmph, you again? Don\'t think admiring the blossoms means I didn\'t notice you stepped away from your code! Need my blade to slash some bugs for you?',
        vi: 'Hứ, lại là bạn đấy à? Đừng tưởng đứng ngắm hoa là ta không thấy bạn trốn việc nhé! Có cần thanh kiếm của ta chém bay vài con bug hộ không?',
        choices: [
            { labelEn: 'Summon Terminal', labelVi: 'Mở Terminal', action: 'summon_term' },
            { labelEn: 'Check system tools', labelVi: 'Xem công cụ hệ thống', action: 'open_tools' }
        ]
    },
    {
        id: 'sakura_greeting_02', category: 'greeting',
        en: 'Oh, you\'re back. It\'s not like I was waiting for you or anything! I was just inspecting the border radius on these UI cards.',
        vi: 'Ồ, bạn về rồi đấy à. Không phải là ta mong ngóng gì bạn đâu nhé! Ta chỉ đang kiểm tra lại độ bo góc viền trên mấy tấm thẻ UI thôi.',
        choices: [
            { labelEn: 'Summon Antigravity AI', labelVi: 'Gọi Antigravity AI', action: 'summon_agy' }
        ]
    },
    {
        id: 'sakura_greeting_03', category: 'greeting',
        en: 'Greetings! Stand up straight. A sloppy posture leads to sloppy CSS styling, and I will NOT tolerate unaligned pixels!',
        vi: 'Chào! Đứng thẳng lưng lên xem nào. Tư thế uể oải sẽ dẫn đến viết CSS ẩu tả đấy, và ta sẽ KHÔNG BAO GIỜ tha thứ cho pixel lệch đâu!',
        choices: []
    },
    {
        id: 'sakura_greeting_04', category: 'greeting',
        en: 'What brings you over here? If you brought runtime exceptions, leave them outside my sakura perimeter!',
        vi: 'Gió nào đưa bạn đến đây thế? Nếu mang theo lỗi runtime thì xin mời để lại ngoài ranh giới hoa anh đào của ta nhé!',
        choices: []
    },
    {
        id: 'sakura_greeting_05', category: 'greeting',
        en: 'Hello! The evening breeze is nice, but don\'t get too relaxed—have you committed your latest branch yet?!',
        vi: 'Chào nhé! Gió chiều thì mát đấy, nhưng đừng có mà lười biếng—bạn đã commit nhánh code mới nhất lên chưa hả?!',
        choices: []
    },
    {
        id: 'sakura_greeting_06', category: 'greeting',
        en: 'Hmph, took you long enough to drop by. Well... since you\'re here, you might as well stay awhile under the shade.',
        vi: 'Hứ, mãi mới chịu ghé qua đây. Cơ mà... tiện đã đến rồi thì ở lại dưới bóng râm này một lát cũng được.',
        choices: []
    },
    {
        id: 'sakura_greeting_07', category: 'greeting',
        en: 'Look alive! My blade is freshly polished and ready to parry any DDoS attacks against your local gateway.',
        vi: 'Tỉnh táo lên nào! Kiếm của ta vừa được mài sắc lẹm, sẵn sàng đỡ gạt mọi đợt tấn công DDoS nhắm vào cổng kết nối của bạn đấy.',
        choices: []
    },
    {
        id: 'sakura_greeting_08', category: 'greeting',
        en: 'Well met. I was just adjusting the red tassel on my kanzashi hairpin. Does it look straight to you, or is it 1px off?!',
        vi: 'Gặp nhau rồi. Ta đang chỉnh lại tua rua đỏ trên trâm kanzashi này. Nhìn xem nó đã thẳng chưa, hay là đang lệch mất 1px?!',
        choices: []
    },

    // 2. repeat_visit (8)
    {
        id: 'sakura_repeat_01', category: 'repeat_visit',
        en: 'Why are you lingering around me so much?! Stop staring, it\'s distracting my design token audits!',
        vi: 'Sao bạn cứ quanh quẩn bên ta mãi thế hả?! Đừng có nhìn chằm chằm nữa, làm ta phân tâm không rà soát được design token đây này!',
        choices: []
    },
    {
        id: 'sakura_repeat_02', category: 'repeat_visit',
        en: 'Back already? Did you encounter a syntax error you couldn\'t handle without my emotional support? Hmph!',
        vi: 'Lại quay lại rồi à? Bộ gặp lỗi cú pháp không tự sửa được nên phải chạy đến tìm ta cầu cứu tinh thần sao? Hứ!',
        choices: []
    },
    {
        id: 'sakura_repeat_03', category: 'repeat_visit',
        en: 'Don\'t get the wrong idea! Just because I didn\'t draw my sword doesn\'t mean you have permission to pester me all day!',
        vi: 'Đừng có hiểu lầm đấy nhé! Ta không rút kiếm ra không có nghĩa là bạn được phép đến quấy rầy ta cả ngày đâu!',
        choices: []
    },
    {
        id: 'sakura_repeat_04', category: 'repeat_visit',
        en: 'You came back twice within minutes... Fine, fine, sit down if your feet hurt. Honestly, you\'re helpless.',
        vi: 'Trong vài phút mà ghé lại tận hai lần... Thôi được rồi, mỏi chân thì ngồi xuống đi. Thật là hết nói nổi bạn mà.',
        choices: []
    },
    {
        id: 'sakura_repeat_05', category: 'repeat_visit',
        en: 'What is it now? Did Lumina tease you again? I told you, come to me if you need someone with actual backbone!',
        vi: 'Lại chuyện gì nữa đây? Có phải bị Lumina trêu chọc không? Đã bảo rồi, có gì thì cứ tìm ta, ta cứng cỏi hơn nhiều!',
        choices: []
    },
    {
        id: 'sakura_repeat_06', category: 'repeat_visit',
        en: 'Are you trying to see how fast I blush? Keep dreaming! My poker face is as solid as an immutable state tree!',
        vi: 'Bạn đang thử xem ta đỏ mặt nhanh cỡ nào đấy à? Đừng hòng nhé! Khuôn mặt ta vững vàng như cây trạng thái bất biến vậy!',
        choices: []
    },
    {
        id: 'sakura_repeat_07', category: 'repeat_visit',
        en: 'Still here? Well... I suppose having company beats listening to crickets all evening. But don\'t flatter yourself!',
        vi: 'Vẫn còn ở đây sao? Ừm... có người đứng cùng dù sao cũng đỡ buồn hơn nghe tiếng dế kêu. Nhưng đừng có mà đắc ý đấy!',
        choices: []
    },
    {
        id: 'sakura_repeat_08', category: 'repeat_visit',
        en: 'If you visit one more time without bringing green tea, I\'m charging you a toll fee in GitHub Stars!',
        vi: 'Nếu lần sau lại ghé qua mà không mang theo trà xanh, ta sẽ thu phí vào cửa bằng GitHub Star của bạn đấy nhé!',
        choices: []
    },

    // 3. player_idle (8)
    {
        id: 'sakura_idle_01', category: 'player_idle',
        en: 'Hey! Why are you standing there frozen like a suspended animation thread? Wake up!',
        vi: 'Này! Sao đứng ngây ra như luồng xử lý bị đóng băng thế kia hả? Mau tỉnh lại coi!',
        choices: []
    },
    {
        id: 'sakura_idle_02', category: 'player_idle',
        en: 'Did your brain run out of memory heap? Blink twice if you need an automatic garbage collection cycle!',
        vi: 'Bộ não bạn bị tràn bộ nhớ heap rồi à? Chớp mắt hai cái nếu cần ta gọi chu trình gom rác (GC) khẩn cấp nhé!',
        choices: []
    },
    {
        id: 'sakura_idle_03', category: 'player_idle',
        en: 'Spacing out again... Well, I have to admit, you look kind of cute when you\'re daydreaming. W-Wait! Forget I said that!',
        vi: 'Lại thả hồn đi đâu rồi... Cơ mà phải thừa nhận là trông bạn lúc ngơ ngác cũng hơi dễ thương. K-Khoan! Quên câu đó đi nhé!',
        choices: []
    },
    {
        id: 'sakura_idle_04', category: 'player_idle',
        en: 'If you stand motionless in this breeze for too long, fallen sakura petals will bury your shoulders completely!',
        vi: 'Nếu bạn cứ đứng im lìm trong gió mãi, cánh hoa anh đào rơi xuống sẽ phủ kín cả vai bạn cho mà xem!',
        choices: []
    },
    {
        id: 'sakura_idle_05', category: 'player_idle',
        en: 'Are you admiring my handcrafted kimono? Hmph, feel free to gaze, the embroidery took three whole weeks to stitch!',
        vi: 'Đang ngắm bộ kimono may tay của ta chứ gì? Hứ, cứ tự nhiên mà ngắm, họa tiết thêu này ta mất trọn ba tuần đấy!',
        choices: []
    },
    {
        id: 'sakura_idle_06', category: 'player_idle',
        en: 'Idle state detected. Don\'t let your creative muscles rust; greatness requires continuous iteration!',
        vi: 'Phát hiện trạng thái nhàn rỗi. Đừng để cơ bắp sáng tạo bị rỉ sét chứ; vĩ đại đòi hỏi phải cải tiến liên tục!',
        choices: []
    },
    {
        id: 'sakura_idle_07', category: 'player_idle',
        en: 'Hey, wake up! If you fall asleep standing up, I won\'t hesitate to poke your cheek with the scabbard of my blade!',
        vi: 'Này, dậy mau! Nếu dám ngủ gật trong lúc đứng, ta không ngại lấy bao kiếm chọc vào má bạn đâu đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_idle_08', category: 'player_idle',
        en: 'Taking a quiet breather, huh? Fine... I\'ll stand guard so nothing disturbs your peace.',
        vi: 'Đang muốn nghỉ ngơi một chút sao? Thôi được... Ta sẽ đứng canh gác cho bạn để không thứ gì quấy rầy sự yên tĩnh này.',
        choices: []
    },

    // 4. player_walk (8)
    {
        id: 'sakura_walk_01', category: 'player_walk',
        en: 'Strolling through my grove like you own the place! Make sure you don\'t kick the flower borders!',
        vi: 'Thong thả dạo bước qua vườn hoa của ta như chốn không người vậy! Cẩn thận đừng có đá trúng luống hoa đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_walk_02', category: 'player_walk',
        en: 'Look at that leisure stride. Did you actually finish your sprint backlog, or are you just pretending to be zen?',
        vi: 'Nhìn cái dáng đi thong dong kìa. Bộ làm xong hết việc trong sprint rồi hay chỉ đang giả vờ bình thản thế hả?',
        choices: []
    },
    {
        id: 'sakura_walk_03', category: 'player_walk',
        en: 'Mind your step on the cobblestones. If you trip and scrape your knee, don\'t expect me to patch you up with bandages!',
        vi: 'Đi đứng cẩn thận trên đá cuội coi. Nếu vấp ngã trầy đầu gối thì đừng có hòng ta mang băng gạc ra dán cho đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_walk_04', category: 'player_walk',
        en: 'A stroll under the cherry blossoms is good for the soul. Even a hothead like me can appreciate a slow walk.',
        vi: 'Đi dạo dưới bóng hoa anh đào thật tốt cho tâm hồn. Ngay cả người nóng tính như ta cũng phải mê những bước chân chậm rãi.',
        choices: []
    },
    {
        id: 'sakura_walk_05', category: 'player_walk',
        en: 'Where are you heading? If you\'re going toward the river, tell Ren to stop mumbling ancient riddles at the water!',
        vi: 'Đang đi đâu đấy? Nếu ra bờ sông thì bảo Ren thôi ngay cái trò lầm bầm mấy câu đố cổ xưa trước mặt nước đi nhé!',
        choices: []
    },
    {
        id: 'sakura_walk_06', category: 'player_walk',
        en: 'Keep that pace. Walking at a steady rhythm is like maintaining a clean 60fps frame rate—smooth and satisfying.',
        vi: 'Cứ giữ nhịp bước đó nhé. Đi đều chân cũng như duy trì khung hình 60fps mượt mà vậy—thanh thoát và êm ái.',
        choices: []
    },
    {
        id: 'sakura_walk_07', category: 'player_walk',
        en: 'The sound of your footsteps is rather rhythmic. I could almost compose an anime theme song to your tempo.',
        vi: 'Tiếng bước chân của bạn nghe khá có nhịp điệu đấy. Ta gần như có thể sáng tác một bản nhạc anime theo tiết tấu này.',
        choices: []
    },
    {
        id: 'sakura_walk_08', category: 'player_walk',
        en: 'Don\'t wander too far out into the wilderness. If you get lost, who\'s going to review my UI component pull requests?!',
        vi: 'Đừng đi quá xa vào vùng hoang vắng nhé. Lạc đường rồi thì ai duyệt pull request các linh kiện UI cho ta hả?!',
        choices: []
    },

    // 5. player_run (8)
    {
        id: 'sakura_run_01', category: 'player_run',
        en: 'Slow down! Who are you running from, a production outage?! You almost trampled my potted bonsai!',
        vi: 'Chậm lại coi! Đang chạy trốn sự cố sập server hay gì thế hả?! Suýt nữa thì giẫm bẹp chậu cây bonsai của ta rồi đấy!',
        choices: []
    },
    {
        id: 'sakura_run_02', category: 'player_run',
        en: 'Look at you sprinting like an over-clocked GPU fan! Take a breather before your legs cramp up!',
        vi: 'Nhìn bạn chạy hùng hục như quạt tản nhiệt GPU bị ép xung vậy! Nghỉ lấy hơi đi kẻo lại bị chuột rút bây giờ!',
        choices: []
    },
    {
        id: 'sakura_run_03', category: 'player_run',
        en: 'Running at top speed on a dirt path? You\'re kicking up dust everywhere! My pristine kimono is getting soiled!',
        vi: 'Chạy hết tốc lực trên đường đất sao? Bụi bay mù mịt cả lên rồi kìa! Bộ kimono trắng muốt của ta bị dơ hết rồi!',
        choices: []
    },
    {
        id: 'sakura_run_04', category: 'player_run',
        en: 'Watch the turn ahead! The bridge entrance is narrow—if you don\'t decelerate, you\'ll launch straight into the river!',
        vi: 'Coi chừng khúc cua phía trước! Lối vào cầu hẹp lắm—không giảm tốc là phi thẳng xuống sông tắm mát luôn đấy!',
        choices: []
    },
    {
        id: 'sakura_run_05', category: 'player_run',
        en: 'Such reckless speed! Are you trying to prove how athletic your avatar is? Hmph, I\'m not impressed! ...Okay, maybe a little.',
        vi: 'Tốc độ liều lĩnh thật đấy! Muốn khoe nhân vật của mình dẻo dai chứ gì? Hứ, ta chẳng thèm ấn tượng đâu! ...Thôi được, có một chút.',
        choices: []
    },
    {
        id: 'sakura_run_06', category: 'player_run',
        en: 'Stop dashing around like a headless chicken! If there is an emergency, just tell me and I\'ll slash through it!',
        vi: 'Đừng chạy lăng xăng như gà mất đầu nữa! Có chuyện gì khẩn cấp thì nói cho ta, ta vung kiếm chém sạch cho!',
        choices: []
    },
    {
        id: 'sakura_run_07', category: 'player_run',
        en: 'Catch your breath, dummy! Your avatar\'s stamina bar isn\'t bottomless, you know!',
        vi: 'Thở đi đồ ngốc! Thanh thể lực của nhân vật cũng có giới hạn chứ không phải vô tận đâu nhé!',
        choices: []
    },
    {
        id: 'sakura_run_08', category: 'player_run',
        en: 'If you want to run that fast, join the village relay marathon next weekend. At least then you might win a ribbon!',
        vi: 'Nếu thích chạy nhanh thế thì đăng ký chạy marathon làng tuần tới đi. Ít ra còn ẵm được cái cúp mang về!',
        choices: []
    },

    // 6. player_sitting (8)
    {
        id: 'sakura_sit_01', category: 'player_sitting',
        en: 'Hey, move over! Don\'t take up the entire bench! There\'s plenty of room for both of us on this two-seater!',
        vi: 'Này, xích qua một bên coi! Đừng có chiếm hết cả chiếc ghế dài chứ! Chiếc ghế hai chỗ này thừa sức cho cả hai đứa ngồi mà!',
        choices: []
    },
    {
        id: 'sakura_sit_02', category: 'player_sitting',
        en: 'Sitting down already? I-It\'s not like I mind if you sit next to me... Just keep your hands to yourself!',
        vi: 'Đã ngồi xuống rồi à? K-Không phải là ta khó chịu khi bạn ngồi cạnh đâu... Chỉ là để tay chân cho nghiêm chỉnh vào đấy!',
        choices: []
    },
    {
        id: 'sakura_sit_03', category: 'player_sitting',
        en: 'The timber on this bench is nicely polished. Kaede smoothed out every splinter so our clothes wouldn\'t snag.',
        vi: 'Mặt gỗ chiếc ghế này được bào nhẵn thín. Kaede đã chà sạch từng cái dằm để không làm rách áo quần chúng ta đấy.',
        choices: []
    },
    {
        id: 'sakura_sit_04', category: 'player_sitting',
        en: 'Are your feet sore from pacing between servers? Fine, rest here. But don\'t lean your heavy head on my shoulder!',
        vi: 'Chân mỏi nhừ vì chạy đi chạy lại giữa các cụm server chứ gì? Được rồi, cứ ngồi nghỉ đi. Nhưng cấm có ngả đầu lên vai ta đấy!',
        choices: []
    },
    {
        id: 'sakura_sit_05', category: 'player_sitting',
        en: 'Watching the sunset from a seated position really changes your mood. Even my sword feels a little lighter.',
        vi: 'Ngồi ngắm hoàng hôn quả thực làm tâm trạng thay đổi hẳn. Đến cả thanh kiếm trên lưng ta dường như cũng nhẹ bớt.',
        choices: []
    },
    {
        id: 'sakura_sit_06', category: 'player_sitting',
        en: 'Quiet, isn\'t it? Just... don\'t say anything sappy. Moments like this are nice enough without corny words.',
        vi: 'Yên ắng thật nhỉ? Chỉ là... đừng có nói mấy lời sến súa đấy. Những lúc thế này cứ im lặng tận hưởng là đủ đẹp rồi.',
        choices: []
    },
    {
        id: 'sakura_sit_07', category: 'player_sitting',
        en: 'A sakura petal just landed right between us on the bench. It\'s just wind currents, don\'t read anything into it!',
        vi: 'Một cánh hoa vừa rơi đúng vào khoảng giữa hai đứa trên ghế này. Chỉ là gió thổi thôi, cấm có suy diễn linh tinh đấy!',
        choices: []
    },
    {
        id: 'sakura_sit_08', category: 'player_sitting',
        en: 'Rest well. When you stand back up, I expect your next feature pull request to be 100% bug-free!',
        vi: 'Nghỉ cho lại sức đi. Lúc đứng dậy, ta mong pull request tính năng tiếp theo của bạn sẽ sạch bóng 100% không một lỗi!',
        choices: []
    },

    // 7. player_holding_can (8)
    {
        id: 'sakura_can_01', category: 'player_holding_can',
        en: 'What did you buy from the vending machine? Cold green tea? Hmph, good choice, at least you have taste.',
        vi: 'Mua cái gì từ máy bán hàng tự động thế? Trà xanh ướp lạnh à? Hứ, lựa chọn không tồi, ít ra bạn cũng biết thưởng thức.',
        choices: []
    },
    {
        id: 'sakura_can_02', category: 'player_holding_can',
        en: 'Don\'t leave the empty aluminum can lying on the grass when you finish! Throw it in the recycle bin by the plaza!',
        vi: 'Uống xong cấm có vứt vỏ lon bừa bãi ra bãi cỏ đấy nhé! Phải bỏ vào thùng tái chế ở quảng trường, nghe chưa!',
        choices: []
    },
    {
        id: 'sakura_can_03', category: 'player_holding_can',
        en: 'The can is sweating condensation droplets. Wipe your hand before you touch your keyboard, dummy!',
        vi: 'Vỏ lon đang đọng đầy nước kìa. Lau tay đi trước khi chạm vào bàn phím máy tính đấy đồ hậu đậu!',
        choices: []
    },
    {
        id: 'sakura_can_04', category: 'player_holding_can',
        en: 'Did you bring one for me? ...No?! Honestly, how can someone be so thoughtless towards a maiden?!',
        vi: 'Có mua thêm một lon cho ta không đấy? ...Không á?! Thật tình, sao lại có người vô tâm với thiếu nữ như thế chứ?!',
        choices: []
    },
    {
        id: 'sakura_can_05', category: 'player_holding_can',
        en: 'Look at that grip pose. Your procedural fingers curl around the can with natural biomechanics. Pretty sleek.',
        vi: 'Nhìn dáng cầm kìa. Các ngón tay tự động uốn cong ôm quanh lon nước trông rất tự nhiên. Khá là mượt mà đấy.',
        choices: []
    },
    {
        id: 'sakura_can_06', category: 'player_holding_can',
        en: 'Hold RMB if you want to take a sip. Just don\'t make loud slurping noises while I\'m trying to concentrate!',
        vi: 'Giữ chuột phải (RMB) nếu muốn uống một ngụm. Chỉ là đừng có húp xì xụp ồn ào khi ta đang tập trung nhé!',
        choices: []
    },
    {
        id: 'sakura_can_07', category: 'player_holding_can',
        en: 'Cold drinks hit differently after a grueling debugging session. Enjoy it, you earned that beverage.',
        vi: 'Đồ uống mát lạnh mang lại cảm giác cực đã sau trận chiến gỡ lỗi căng thẳng. Cứ tận hưởng đi, bạn xứng đáng với nó.',
        choices: []
    },
    {
        id: 'sakura_can_08', category: 'player_holding_can',
        en: 'That iced matcha can has 150mg of caffeine. If you stay up coding all night again, I\'m pulling the power plug!',
        vi: 'Lon matcha đá đó có tận 150mg caffeine đấy. Nếu bạn lại thức thâu đêm gõ code, ta sẽ rút thẳng dây nguồn cho coi!',
        choices: []
    },

    // 8. player_holding_mug (8)
    {
        id: 'sakura_mug_01', category: 'player_holding_mug',
        en: 'Ooh, a warm mug! The steam smells like roasted hojicha tea. Mind pouring a cup for your guardian?',
        vi: 'Ồ, một chiếc cốc ấm áp! Khói bốc lên thơm ngát mùi trà hojicha rang. Có muốn rót một chén cho người hộ vệ này không?',
        choices: []
    },
    {
        id: 'sakura_mug_02', category: 'player_holding_mug',
        en: 'Holding a warm mug with both hands... You look like an anime protagonist pondering their tragic backstory.',
        vi: 'Hai tay nâng niu chiếc cốc ấm... Trông bạn như nhân vật chính anime đang hồi tưởng về quá khứ bi thương vậy.',
        choices: []
    },
    {
        id: 'sakura_mug_03', category: 'player_holding_mug',
        en: 'Blow on it gently before taking a sip! If you scorch your tongue, don\'t come crying to me for ice!',
        vi: 'Thổi nhẹ nhẹ trước khi nhấp ngụm nào! Bỏng lưỡi rồi thì đừng có chạy đến tìm ta mượn đá chườm nhé!',
        choices: []
    },
    {
        id: 'sakura_mug_04', category: 'player_holding_mug',
        en: 'The ceramic glaze is patterned with cherry blossom petals. Did you steal that mug from my shrine pantry?!',
        vi: 'Men gốm vẽ hoa văn cánh anh đào tinh xảo kìa. Có phải bạn vừa lén thó chiếc cốc đó từ chạn bát đền của ta không?!',
        choices: []
    },
    {
        id: 'sakura_mug_05', category: 'player_holding_mug',
        en: 'Hot drinks soothe the throat after arguing with junior developers in code review. Sip deeply and let it go.',
        vi: 'Thức uống nóng làm dịu cổ họng sau những màn tranh luận nảy lửa lúc chấm code review. Uống một ngụm rồi bỏ qua đi.',
        choices: []
    },
    {
        id: 'sakura_mug_06', category: 'player_holding_mug',
        en: 'Look at the steam rising against the purple sunset. It creates such an authentic anime aesthetic.',
        vi: 'Nhìn làn khói mỏng lượn bay trên nền hoàng hôn tím ngắt kìa. Tạo nên một khung hình anime đích thực đấy.',
        choices: []
    },
    {
        id: 'sakura_mug_07', category: 'player_holding_mug',
        en: 'Keep that mug balanced. If you spill hot liquid onto your lap, I will laugh out loud before helping you!',
        vi: 'Cầm cốc cho chắc vào. Làm đổ nước nóng vào người thì ta sẽ cười phá lên trước rồi mới thèm giúp đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_mug_08', category: 'player_holding_mug',
        en: 'A warm beverage is the ultimate comfort. Take your time and savor the roasted aroma.',
        vi: 'Một thức uống nóng hổi là niềm an ủi tuyệt vời nhất. Cứ thong thả tận hưởng hương trà rang nồng ấm nhé.',
        choices: []
    },

    // 9. player_holding_bottle (8)
    {
        id: 'sakura_bottle_01', category: 'player_holding_bottle',
        en: 'Carrying a water bottle? Good. Developers who live on energy drinks alone are a recipe for disaster!',
        vi: 'Mang theo bình nước à? Tốt. Lập trình viên mà chỉ sống dựa vào nước tăng lực thì sớm muộn cũng toang thôi!',
        choices: []
    },
    {
        id: 'sakura_bottle_02', category: 'player_holding_bottle',
        en: 'Is that mineral water from the shrine fountain? It has natural spring electrolytes, blessed by the spirits.',
        vi: 'Nước khoáng lấy từ giếng đền của ta đấy à? Nước suối tự nhiên giàu khoáng chất, đã được thần linh ban phúc đấy nhé.',
        choices: []
    },
    {
        id: 'sakura_bottle_03', category: 'player_holding_bottle',
        en: 'Screw the cap on tight! If it leaks inside your inventory bag, all your virtual paper files will turn to mush!',
        vi: 'Vặn chặt nắp bình vào coi! Nước rỉ ra túi đồ làm ướt hết tài liệu ảo bên trong bây giờ!',
        choices: []
    },
    {
        id: 'sakura_bottle_04', category: 'player_holding_bottle',
        en: 'Plain water might taste boring, but your kidneys will thank you twenty years from now. Drink up!',
        vi: 'Nước lọc có thể hơi nhạt nhẽo, nhưng quả thận của bạn sẽ biết ơn bạn sau hai mươi năm nữa đấy. Uống đi!',
        choices: []
    },
    {
        id: 'sakura_bottle_05', category: 'player_holding_bottle',
        en: 'You look like a hiker preparing to scale the alpine peaks. Don\'t forget to pack some trail snacks too!',
        vi: 'Trông bạn như phượt thủ chuẩn bị leo núi tuyết vậy. Đừng quên nhét thêm ít đồ ăn nhẹ dự phòng vào túi nhé!',
        choices: []
    },
    {
        id: 'sakura_bottle_06', category: 'player_holding_bottle',
        en: 'The clear bottle refracts the cherry blossoms upside down. That\'s a neat ray-tracing optic effect!',
        vi: 'Bình nước trong suốt khúc xạ hình hoa anh đào lộn ngược kìa. Hiệu ứng quang học ray-tracing thú vị phết đấy!',
        choices: []
    },
    {
        id: 'sakura_bottle_07', category: 'player_holding_bottle',
        en: 'If you finish that whole bottle, you have to jog across the bridge to refill it at the natural spring!',
        vi: 'Uống hết cả bình đó là bạn phải chạy qua cầu sang suối tự nhiên để lấy nước đổ đầy lại đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_bottle_08', category: 'player_holding_bottle',
        en: 'Stay hydrated so your temper doesn\'t flare as quickly as mine does. Balance is essential!',
        vi: 'Uống đủ nước để không bị nóng tính như ta nhé. Sự cân bằng trong cơ thể là điều tối quan trọng!',
        choices: []
    },

    // 10. player_holding_phone (8)
    {
        id: 'sakura_phone_01', category: 'player_holding_phone',
        en: 'Staring into that pocket smartphone screen? Keep that up and you\'ll need glasses thicker than Kaede\'s goggles!',
        vi: 'Dán mắt vào cái màn hình điện thoại tí hon đó mãi thế à? Cứ thế thì sớm muộn cũng phải đeo kính dày cộp như kính bảo hộ của Kaede thôi!',
        choices: []
    },
    {
        id: 'sakura_phone_02', category: 'player_holding_phone',
        en: 'Are you testing the mobile touch interface of TeleTerm? Tell me the responsive drawer feels silky smooth!',
        vi: 'Đang kiểm thử giao diện cảm ứng di động của TeleTerm chứ gì? Nói mau, cái ngăn kéo điều khiển vuốt có mượt như lụa không?!',
        choices: []
    },
    {
        id: 'sakura_phone_03', category: 'player_holding_phone',
        en: 'I spent hours optimizing the mobile bottom navigation bar so your thumbs wouldn\'t strain. Appreciate it!',
        vi: 'Ta đã mất hàng giờ tinh chỉnh thanh điều hướng đáy trên điện thoại để ngón tay cái bạn không bị mỏi đấy. Biết ơn đi!',
        choices: []
    },
    {
        id: 'sakura_phone_04', category: 'player_holding_phone',
        en: 'Who are you texting? Don\'t tell me you\'re browsing social feeds while standing right in front of me?!',
        vi: 'Đang nhắn tin cho ai thế? Đừng nói là dám lướt mạng xã hội ngay trước mặt một mỹ nhân như ta đấy nhé?!',
        choices: []
    },
    {
        id: 'sakura_phone_05', category: 'player_holding_phone',
        en: 'The phone haptics in this system simulate physical button clicks. Real tactile feedback makes all the difference.',
        vi: 'Bộ rung trên điện thoại mô phỏng tiếng bấm nút vật lý rất chuẩn. Phản hồi xúc giác thực sự tạo nên sự khác biệt.',
        choices: []
    },
    {
        id: 'sakura_phone_06', category: 'player_holding_phone',
        en: 'Don\'t drop that phone onto the rocks! Glass repairs in this countryside take forever to ship from Tokyo!',
        vi: 'Cẩn thận kẻo làm rơi điện thoại xuống đá tảng bây giờ! Ở vùng quê này đặt kính ép màn hình từ Tokyo về lâu lắm đấy!',
        choices: []
    },
    {
        id: 'sakura_phone_07', category: 'player_holding_phone',
        en: 'Checking your server stats on the go... You really are an obsessive developer. I respect the grind, though.',
        vi: 'Kiểm tra thông số server mọi lúc mọi nơi... Bạn đúng là kẻ cuồng việc. Nhưng ta tôn trọng sự nỗ lực đó.',
        choices: []
    },
    {
        id: 'sakura_phone_08', category: 'player_holding_phone',
        en: 'Put the screen away for five minutes and look at the real sky! Even high-DPI OLED panels cannot match this dusk.',
        vi: 'Cất cái màn hình đi năm phút và ngắm nhìn bầu trời thật đi! Đến cả màn hình OLED siêu nét cũng không sánh được với hoàng hôn này đâu.',
        choices: []
    },

    // 11. player_holding_book (8)
    {
        id: 'sakura_book_01', category: 'player_holding_book',
        en: 'A physical book? Are you trying to look intellectual under my cherry tree? Hmph, what are you reading anyway?',
        vi: 'Sách giấy cơ à? Định tỏ ra uyên bác dưới gốc anh đào của ta chứ gì? Hứ, mà đang đọc cái gì thế hả?',
        choices: []
    },
    {
        id: 'sakura_book_02', category: 'player_holding_book',
        en: 'If that\'s a book on UI design principles, open to page 42: "Never use Comic Sans or raw unstyled alert dialogs!"',
        vi: 'Nếu đó là sách về nguyên lý thiết kế UI thì giở trang 42 ra ngay: "Tuyệt đối không dùng Comic Sans hoặc hộp thoại alert thô sơ!"',
        choices: []
    },
    {
        id: 'sakura_book_03', category: 'player_holding_book',
        en: 'Careful with the pages! Don\'t bend the corner dog-ears; use a proper sakura bookmark like a civilized reader!',
        vi: 'Nhẹ tay lật trang thôi! Cấm gấp mép góc sách làm dấu nhé; dùng một chiếc kẹp sách hoa anh đào tử tế coi!',
        choices: []
    },
    {
        id: 'sakura_book_04', category: 'player_holding_book',
        en: 'Studying legacy algorithms? Old techniques were crafted when memory was scarce. There is discipline in constraint.',
        vi: 'Nghiên cứu thuật toán cổ à? Những kỹ thuật xưa được viết khi bộ nhớ cực kỳ khan hiếm. Rất đáng học hỏi tính kỷ luật đó.',
        choices: []
    },
    {
        id: 'sakura_book_05', category: 'player_holding_book',
        en: 'Reading under drifting blossom petals... I have to admit, you look like a painting out of an anime artbook.',
        vi: 'Đọc sách dưới những cánh hoa rơi lả tả... Phải công nhận trông bạn hệt như một bức họa trong tập tranh anime.',
        choices: []
    },
    {
        id: 'sakura_book_06', category: 'player_holding_book',
        en: 'Don\'t just memorize theory from books; code is meant to be compiled and battle-tested in production!',
        vi: 'Đừng chỉ học vẹt lý thuyết suông trong sách; code là để biên dịch và tôi luyện trong thực tế sản xuất!',
        choices: []
    },
    {
        id: 'sakura_book_07', category: 'player_holding_book',
        en: 'Did you find anything interesting in there? You can read a paragraph out loud to me if you want... I won\'t mind.',
        vi: 'Có đoạn nào hay không? Bạn có thể đọc to một đoạn cho ta nghe nếu thích... Ta không ngại lắng nghe đâu.',
        choices: []
    },
    {
        id: 'sakura_book_08', category: 'player_holding_book',
        en: 'A good book enriches the soul just as a clean refactor enriches a codebase. Treasure that knowledge.',
        vi: 'Một cuốn sách hay bồi đắp tâm hồn cũng như một đợt refactor chỉn chu làm sáng bừng mã nguồn vậy. Hãy trân trọng tri thức đó.',
        choices: []
    },

    // 12. player_drinking (8)
    {
        id: 'sakura_drink_01', category: 'player_drinking',
        en: 'Hey, don\'t drink so fast! You\'ll swallow air and start hiccuping during your next team meeting!',
        vi: 'Này, đừng tu nhanh thế! Uống vội là nuốt phải hơi rồi nấc cụt trong buổi họp nhóm tiếp theo cho coi!',
        choices: []
    },
    {
        id: 'sakura_drink_02', category: 'player_drinking',
        en: 'Gulping down that drink like you just crossed the Sahara desert! Was your throat really that parched?!',
        vi: 'Uống ừng ực như vừa băng qua sa mạc Sahara vậy! Cổ họng khô khốc đến thế cơ à?!',
        choices: []
    },
    {
        id: 'sakura_drink_03', category: 'player_drinking',
        en: 'The procedural drinking kinematics look spot-on. Hand tilts up, can reaches mouth, zero visual jitter.',
        vi: 'Chuyển động học khi uống nước nhìn rất chuẩn xác. Tay nâng lên, lon chạm miệng, góc nhìn camera không hề rung lắc.',
        choices: []
    },
    {
        id: 'sakura_drink_04', category: 'player_drinking',
        en: 'Did it taste good? Next time, remember to buy two cans so you can share with your loyal systems guardian!',
        vi: 'Ngon không? Lần sau nhớ mua hai lon để còn chia cho người hộ vệ trung thành này nữa nhé!',
        choices: []
    },
    {
        id: 'sakura_drink_05', category: 'player_drinking',
        en: 'Ah, wiped your mouth with the back of your sleeve? How unrefined! Here, use this clean embroidered handkerchief!',
        vi: 'A, lại lấy tay áo quẹt miệng à? Bất lịch sự quá đấy! Này, cầm lấy chiếc khăn tay thêu sạch sẽ này mà lau!',
        choices: []
    },
    {
        id: 'sakura_drink_06', category: 'player_drinking',
        en: 'Feeling energized now? Good! Because laziness is the sworn enemy of flawless user interfaces!',
        vi: 'Thấy tràn đầy năng lượng rồi chứ gì? Tốt! Vì sự lười biếng là kẻ thù không đội trời chung của giao diện hoàn hảo!',
        choices: []
    },
    {
        id: 'sakura_drink_07', category: 'player_drinking',
        en: 'Watching you enjoy a cold sip almost makes me thirsty too. Maybe I should raid the vending machine myself.',
        vi: 'Nhìn bạn uống nước ngon lành làm ta cũng thấy thèm. Có khi ta phải ra càn quét cái máy bán hàng tự động mới được.',
        choices: []
    },
    {
        id: 'sakura_drink_08', category: 'player_drinking',
        en: 'Drink finished? Then toss the can properly and get back to crafting pixel-perfect magic!',
        vi: 'Uống xong rồi chứ? Vứt vỏ lon vào đúng nơi quy định rồi quay lại tạo nên những điều kỳ diệu chuẩn từng pixel đi nào!',
        choices: []
    },

    // 13. player_using_terminal (8)
    {
        id: 'sakura_terminal_01', category: 'player_using_terminal',
        en: 'Shell session active! I\'m standing right behind you with my katana—if any segfault dare shows its face, it\'s sliced!',
        vi: 'Phiên dòng lệnh đã mở! Ta đang đứng ngay sau lưng bạn cùng thanh katana—con segfault nào dám ló mặt ra là bị chém đứt đôi!',
        choices: []
    },
    {
        id: 'sakura_terminal_02', category: 'player_using_terminal',
        en: 'Look at those fast keystrokes! But don\'t sacrifice code readability for typing speed, hear me?!',
        vi: 'Gõ phím nhanh đấy! Nhưng cấm có đánh đổi độ rõ ràng của code lấy tốc độ gõ phím đâu nhé, nghe rõ chưa?!',
        choices: []
    },
    {
        id: 'sakura_terminal_03', category: 'player_using_terminal',
        en: 'Green monospace characters cascading down the holographic terminal... It looks undeniably badass.',
        vi: 'Ký tự monospace xanh lục tuôn trào trên màn hình hologram... Phải công nhận trông ngầu lòi ra phết.',
        choices: []
    },
    {
        id: 'sakura_terminal_04', category: 'player_using_terminal',
        en: 'Don\'t type `rm -rf /` by accident! If you wipe your root directory, I am NOT restoring your backups for you!',
        vi: 'Đừng có lỡ tay gõ `rm -rf /` đấy nhé! Xóa sạch ổ gốc là ta KHÔNG BAO GIỜ khôi phục bản sao lưu cho bạn đâu!',
        choices: []
    },
    {
        id: 'sakura_terminal_05', category: 'player_using_terminal',
        en: 'Our ConPTY terminal engine operates with zero input lag. You have no excuses for typographical errors!',
        vi: 'Trình điều khiển terminal ConPTY chạy không hề có độ trễ phím. Bạn không có lý do gì để gõ sai chính tả đâu nhé!',
        choices: []
    },
    {
        id: 'sakura_terminal_06', category: 'player_using_terminal',
        en: 'Running unit tests? If you get all green checks, I might brew you a special batch of cherry blossom tea.',
        vi: 'Đang chạy unit test à? Nếu vượt qua hết với màu xanh tuyệt đối, có thể ta sẽ đặc cách pha cho bạn một ấm trà hoa anh đào.',
        choices: []
    },
    {
        id: 'sakura_terminal_07', category: 'player_using_terminal',
        en: 'Focus mode brings the terminal forward while dimming the 3D world. Don\'t forget the real world is still out here!',
        vi: 'Chế độ Focus đưa terminal lên trước và làm mờ thế giới 3D. Nhớ là thế giới ngoài này vẫn đang đợi bạn đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_terminal_08', category: 'player_using_terminal',
        en: 'Keep pushing forward! When you conquer this terminal task, the whole team will celebrate your commit.',
        vi: 'Tiến lên nào! Khi bạn hoàn thành nhiệm vụ này, cả đội sẽ ăn mừng cho commit của bạn.',
        choices: []
    },

    // 14. player_chatting (8)
    {
        id: 'sakura_chat_01', category: 'player_chatting',
        en: 'Who are you typing messages to?! If it\'s another girl on this server, you better tell me immediately!',
        vi: 'Đang gõ tin nhắn cho ai đấy hả?! Nếu là cô gái khác trong server này thì liệu hồn mà khai báo ngay cho ta!',
        choices: []
    },
    {
        id: 'sakura_chat_02', category: 'player_chatting',
        en: 'Whispering with `/m`? Private chats have their own reply button now. Make sure you don\'t leak confidential tokens!',
        vi: 'Gửi mật thư bằng lệnh `/m` à? Tin nhắn riêng giờ có nút Reply nhanh rồi đấy. Nhớ là không được làm lộ token bí mật đâu nhé!',
        choices: []
    },
    {
        id: 'sakura_chat_03', category: 'player_chatting',
        en: 'The chat bubble over your head popped up! It has proper backdrop blur and contrast-compliant font styling.',
        vi: 'Bong bóng chat trên đầu bạn hiện lên rồi kìa! Có hiệu ứng làm mờ nền và màu chữ tương phản đạt chuẩn WCAG đàng hoàng.',
        choices: []
    },
    {
        id: 'sakura_chat_04', category: 'player_chatting',
        en: 'Don\'t spam emojis in global chat! Maintain professional etiquette even in a virtual anime metaverse!',
        vi: 'Đừng có xả emoji bừa bãi trên kênh chat chung! Phải giữ tác phong chuyên nghiệp ngay cả trong thế giới ảo chứ!',
        choices: []
    },
    {
        id: 'sakura_chat_05', category: 'player_chatting',
        en: 'Did someone ask you for technical support? Be patient with them; remember when you were a confused beginner yourself.',
        vi: 'Có ai đang nhờ bạn hỗ trợ kỹ thuật à? Kiên nhẫn với họ một chút; nhớ lại hồi bạn mới chập chững vào nghề đi.',
        choices: []
    },
    {
        id: 'sakura_chat_06', category: 'player_chatting',
        en: 'You can press Escape to cancel whisper mode if you selected the wrong target recipient. Very handy.',
        vi: 'Bạn có thể bấm phím Escape để hủy chế độ mật thư nếu lỡ chọn nhầm người nhận đấy. Rất tiện lợi.',
        choices: []
    },
    {
        id: 'sakura_chat_07', category: 'player_chatting',
        en: 'Communicating clearly is 80% of software engineering success. Write with precision and kindness.',
        vi: 'Giao tiếp rõ ràng chiếm tới 80% thành công trong ngành kỹ thuật phần mềm. Hãy gõ chữ với sự chuẩn xác và thiện chí.',
        choices: []
    },
    {
        id: 'sakura_chat_08', category: 'player_chatting',
        en: 'Finished chatting? Good! Now close the chat box and look at me when I\'m talking to you!',
        vi: 'Chat xong chưa? Tốt! Giờ thì đóng khung chat lại và nhìn thẳng vào ta khi ta đang nói chuyện coi!',
        choices: []
    },

    // 15. location_hub (8)
    {
        id: 'sakura_hub_01', category: 'location_hub',
        en: 'The central hub plaza... Look at the floor tiling: every stone is aligned to a strict 8-point spatial grid!',
        vi: 'Quảng trường trung tâm... Hãy nhìn những phiến đá lát sàn: từng viên đều được căn chỉnh theo lưới không gian 8-point nghiêm ngặt!',
        choices: []
    },
    {
        id: 'sakura_hub_02', category: 'location_hub',
        en: 'This is where everyone spawns into the world. If there were any visual clipping bugs here, I would personally resign!',
        vi: 'Đây là nơi mọi người xuất hiện khi vào game. Nếu ở đây mà có lỗi đồ họa đâm xuyên thì ta đã tự nộp đơn từ chức rồi!',
        choices: []
    },
    {
        id: 'sakura_hub_03', category: 'location_hub',
        en: 'The top navigation bar displays your status cleanly. I made sure it stays pristine and unobtrusive.',
        vi: 'Thanh điều hướng trên cùng hiển thị trạng thái rất gọn gàng. Ta đã đích thân tối ưu để nó thanh thoát và không vướng mắt.',
        choices: []
    },
    {
        id: 'sakura_hub_04', category: 'location_hub',
        en: 'Don\'t just hang around the spawn point all day! Go explore the countryside; Kaede and Ren worked hard on the scenery.',
        vi: 'Đừng có đứng chôn chân ở điểm hồi sinh cả ngày! Đi khám phá đồng quê đi; Kaede và Ren đã bỏ bao công sức tạo cảnh quan đấy.',
        choices: []
    },
    {
        id: 'sakura_hub_05', category: 'location_hub',
        en: 'The hub platform has built-in lighting so you never get lost even if you wander back at midnight.',
        vi: 'Bệ trung tâm có hệ thống đèn ngầm định hướng để bạn không bao giờ bị lạc dù có quay về lúc nửa đêm.',
        choices: []
    },
    {
        id: 'sakura_hub_06', category: 'location_hub',
        en: 'Notice how the camera smoothly orbits when you stand at the center. Clean framing is essential for good screenshots.',
        vi: 'Hãy để ý cách camera xoay êm ái khi bạn đứng ở trung tâm. Góc máy chuẩn là yếu tố cốt lõi để chụp ảnh đẹp.',
        choices: []
    },
    {
        id: 'sakura_hub_07', category: 'location_hub',
        en: 'If you want to test avatar presets, the plaza has optimal directional lighting for inspection.',
        vi: 'Nếu muốn thử các bộ trang phục avatar mới, quảng trường có ánh sáng hướng chuẩn nhất để bạn ngắm nghía.',
        choices: []
    },
    {
        id: 'sakura_hub_08', category: 'location_hub',
        en: 'Welcome to the heart of TeleTerm. Whenever you need a familiar landmark, return to this plaza.',
        vi: 'Chào mừng bạn đến với trái tim của TeleTerm. Bất cứ khi nào cần một mốc định vị quen thuộc, hãy quay về nơi này.',
        choices: []
    },

    // 16. location_village (8)
    {
        id: 'sakura_village_01', category: 'location_village',
        en: 'The village square! The wooden eaves and vintage lanterns give this place authentic Edo-era charm.',
        vi: 'Quảng trường làng quê! Những mái hiên gỗ và đèn lồng cổ kính mang lại vẻ đẹp đậm chất thời kỳ Edo truyền thống.',
        choices: []
    },
    {
        id: 'sakura_village_02', category: 'location_village',
        en: 'Did you see the vintage bicycle parked near the roadside fence? Ring its bell if you want to make some noise!',
        vi: 'Bạn có thấy chiếc xe đạp cổ dựng cạnh hàng rào ven đường không? Rung chuông một tiếng xem nghe vui tai không nào!',
        choices: []
    },
    {
        id: 'sakura_village_03', category: 'location_village',
        en: 'The roadside rest stop has tea and shade. It\'s where travelers recharge before crossing the bridge.',
        vi: 'Trạm dừng chân ven đường có trà ngon và bóng râm. Đó là nơi lữ khách nạp lại năng lượng trước khi qua cầu.',
        choices: []
    },
    {
        id: 'sakura_village_04', category: 'location_village',
        en: 'I love this village because it proves technology and traditional craftsmanship can live together in harmony.',
        vi: 'Ta yêu ngôi làng này vì nó chứng minh công nghệ hiện đại và tay nghề thủ công truyền thống hoàn toàn có thể hòa quyện.',
        choices: []
    },
    {
        id: 'sakura_village_05', category: 'location_village',
        en: 'Watch where you step along the narrow stone alleyways; some of the mossy stones are slick!',
        vi: 'Đi đứng cẩn thận trong mấy con ngõ lát đá hẹp nhé; vài phiến đá phủ rêu xanh khá trơn trượt đấy!',
        choices: []
    },
    {
        id: 'sakura_village_06', category: 'location_village',
        en: 'The village square is the cultural soul of our open world. Savor the quiet rustic rhythm.',
        vi: 'Quảng trường làng chính là linh hồn văn hóa của thế giới mở này. Hãy tận hưởng nhịp sống mộc mạc, yên bình.',
        choices: []
    },
    {
        id: 'sakura_village_07', category: 'location_village',
        en: 'If you ever feel overwhelmed by modern city life, this village will always offer you sanctuary.',
        vi: 'Nếu có lúc nào thấy ngột ngạt vì cuộc sống xô bồ chốn thành thị, ngôi làng này sẽ luôn dang rộng vòng tay đón bạn.',
        choices: []
    },
    {
        id: 'sakura_village_08', category: 'location_village',
        en: 'The sunset over the village roofs creates long dramatic shadows. Truly a painter\'s dream scene.',
        vi: 'Hoàng hôn chiếu qua mái ngói làng quê tạo nên những vệt bóng đổ dài ấn tượng. Đúng là khung cảnh trong mơ của họa sĩ.',
        choices: []
    },

    // 17. location_rice_field (8)
    {
        id: 'sakura_rice_01', category: 'location_rice_field',
        en: 'The stepped rice terraces! Look at that terraced topography: each level maintains a precise elevation step!',
        vi: 'Những thửa ruộng bậc thang! Nhìn vào địa hình tầng tầng lớp lớp kia xem: từng bậc đều duy trì độ chênh cao chuẩn xác!',
        choices: []
    },
    {
        id: 'sakura_rice_02', category: 'location_rice_field',
        en: 'Don\'t go falling into the flooded rice paddies! Drying out wet robes takes hours, and I won\'t iron them for you!',
        vi: 'Cấm có trượt chân rơi xuống ruộng ngập nước đấy nhé! Phơi khô áo dài mất hàng giờ liền, và ta sẽ không ủi hộ đâu!',
        choices: []
    },
    {
        id: 'sakura_rice_03', category: 'location_rice_field',
        en: 'The lush green stalks rustle softly in the wind. Green is such an eye-relaxing hue for exhausted developers.',
        vi: 'Những bông lúa xanh non xào xạc trong gió. Sắc xanh lục thật êm dịu cho đôi mắt mỏi mệt của các lập trình viên.',
        choices: []
    },
    {
        id: 'sakura_rice_04', category: 'location_rice_field',
        en: 'Irrigation channels guide clean water smoothly through the terraces. It\'s an ancient marvel of civil engineering.',
        vi: 'Hệ thống kênh mương dẫn nước trong veo chảy nhịp nhàng qua từng bậc ruộng. Một kỳ quan công trình cổ xưa đáng khâm phục.',
        choices: []
    },
    {
        id: 'sakura_rice_05', category: 'location_rice_field',
        en: 'Treading the narrow dirt ridges requires balance. If you can walk these bunds, your motor coordination is fine.',
        vi: 'Đi trên bờ ruộng đất hẹp đòi hỏi khả năng giữ thăng bằng tốt. Đi được trên này là kỹ năng vận động còn chuẩn lắm.',
        choices: []
    },
    {
        id: 'sakura_rice_06', category: 'location_rice_field',
        en: 'Look at the reflections of the clouds in the still water. It mirrors the sky with 100% fidelity.',
        vi: 'Nhìn bóng mây in trên mặt nước phẳng lặng xem. Nó phản chiếu cả bầu trời với độ chân thực tuyệt đối.',
        choices: []
    },
    {
        id: 'sakura_rice_07', category: 'location_rice_field',
        en: 'Rice sustains life just as foundational core libraries sustain all application software.',
        vi: 'Hạt gạo nuôi sống con người cũng hệt như những thư viện cốt lõi nền tảng nuôi dưỡng toàn bộ phần mềm ứng dụng.',
        choices: []
    },
    {
        id: 'sakura_rice_08', category: 'location_rice_field',
        en: 'The scent of damp fertile earth and fresh rice shoots is so revitalizing. Inhale deeply!',
        vi: 'Mùi đất phù sa ẩm ướt quyện cùng hương mạ non ngát lành thật sảng khoái. Hít một hơi thật sâu vào lồng ngực nào!',
        choices: []
    },

    // 18. location_river (8)
    {
        id: 'sakura_river_01', category: 'location_river',
        en: 'The riverbank! Stay back from the edge; the water flows faster than it looks from up here!',
        vi: 'Bờ sông đây rồi! Lùi lại xa mép nước một chút; dòng nước chảy xiết hơn vẻ bề ngoài nhìn từ trên này đấy!',
        choices: []
    },
    {
        id: 'sakura_river_02', category: 'location_river',
        en: 'Look at the riverbed: smooth grey pebbles and crystal rapids. Zero visual artifacts in the water shader!',
        vi: 'Nhìn lòng sông xem: sỏi cuội xám bóng và những gợn nước trong vắt. Bộ shader mặt nước không có chút lỗi vỡ hạt nào!',
        choices: []
    },
    {
        id: 'sakura_river_03', category: 'location_river',
        en: 'Do NOT try to wade across the river! We have an arched bridge right over there for a reason, dummy!',
        vi: 'CẤM được lội bừa qua sông đấy! Người ta xây cây cầu vòm gỗ sờ sờ ngay kia là có lý do cả đấy, đồ ngốc!',
        choices: []
    },
    {
        id: 'sakura_river_04', category: 'location_river',
        en: 'The riverside campfire is a great place to warm up your hands when the evening chill sets in.',
        vi: 'Đống lửa trại bên bờ sông là nơi lý tưởng để hơ ấm đôi tay khi cái se lạnh của buổi chiều muộn bắt đầu buông xuống.',
        choices: []
    },
    {
        id: 'sakura_river_05', category: 'location_river',
        en: 'I often sit on the riverside bench to sharpen my blade against a whetstone. The sound of water drowns out all noise.',
        vi: 'Ta thường ngồi trên chiếc ghế bên sông để mài thanh kiếm này. Tiếng nước chảy át đi mọi ồn ào hỗn tạp.',
        choices: []
    },
    {
        id: 'sakura_river_06', category: 'location_river',
        en: 'Water reflections change color as the twilight deepens. It\'s like nature\'s own dynamic color palette generator.',
        vi: 'Màu nước phản chiếu biến ảo dần khi hoàng hôn sẫm lại. Tựa như bảng phối màu tự nhiên tự động của tạo hóa vậy.',
        choices: []
    },
    {
        id: 'sakura_river_07', category: 'location_river',
        en: 'Listen to the river murmurs. If you let it, the sound will sweep away all lingering compiler anxieties.',
        vi: 'Lắng nghe tiếng suối rì rào đi. Nó sẽ cuốn phăng mọi nỗi lo lắng về các bài kiểm tra biên dịch còn sót lại.',
        choices: []
    },
    {
        id: 'sakura_river_08', category: 'location_river',
        en: 'Keep following the river downstream and you\'ll eventually reach the sandy ocean shores.',
        vi: 'Cứ đi xuôi theo dòng sông này là bạn sẽ đến được bờ biển cát vàng bao la phía trước đấy.',
        choices: []
    },

    // 19. location_bridge (8)
    {
        id: 'sakura_bridge_01', category: 'location_bridge',
        en: 'The arched timber bridge! Look at that graceful curve—Kaede really outdid himself with the structural carpentry!',
        vi: 'Cây cầu vòm gỗ trứ danh! Nhìn đường cong duyên dáng kia xem—Kaede thực sự đã vượt lên chính mình với kết cấu mộc này!',
        choices: []
    },
    {
        id: 'sakura_bridge_02', category: 'location_bridge',
        en: 'Hold onto the railing if you get dizzy from heights! The deck arches up significantly in the middle.',
        vi: 'Bám vào thành cầu nếu thấy hơi chóng mặt nhé! Mặt cầu uốn vồng lên khá cao ở đoạn chính giữa đấy.',
        choices: []
    },
    {
        id: 'sakura_bridge_03', category: 'location_bridge',
        en: 'This bridge is the primary navigation artery across the river. All pathfinding logic routes through here!',
        vi: 'Cây cầu này là huyết mạch giao thông chính bắc qua sông. Mọi thuật toán tìm đường đều phải đi qua đây!',
        choices: []
    },
    {
        id: 'sakura_bridge_04', category: 'location_bridge',
        en: 'Looking down from the center span, the view in both directions is pure cinematic perfection.',
        vi: 'Đứng giữa nhịp cầu nhìn xuống, tầm nhìn sang cả hai phía đều đẹp chuẩn chất điện ảnh không tì vết.',
        choices: []
    },
    {
        id: 'sakura_bridge_05', category: 'location_bridge',
        en: 'The cedar planks under our feet are sturdy enough to support heavy equipment. Don\'t worry about it giving way!',
        vi: 'Những tấm ván tuyết tùng dưới chân chúng ta vững đến mức chở được cả thiết bị nặng. Không sợ sập đâu mà lo!',
        choices: []
    },
    {
        id: 'sakura_bridge_06', category: 'location_bridge',
        en: 'Whenever I stand at the top of the arch, the wind catches my ribbons. It makes for a dramatic anime hero pose!',
        vi: 'Mỗi khi đứng trên đỉnh vòm cầu, gió lại thổi tung dải lụa của ta. Trông chuẩn dáng dấp anh hùng anime luôn!',
        choices: []
    },
    {
        id: 'sakura_bridge_07', category: 'location_bridge',
        en: 'Cross over carefully. The southern shore holds the wilder, more untamed parts of our island realm.',
        vi: 'Băng qua cẩn thận nhé. Bờ phía nam là vùng đất hoang sơ và kỳ thú hơn nhiều của hòn đảo này.',
        choices: []
    },
    {
        id: 'sakura_bridge_08', category: 'location_bridge',
        en: 'Two shores united by a single timber arch... Even a fierce warrior like me can appreciate architectural harmony.',
        vi: 'Hai bờ được nối liền bởi một nhịp cầu gỗ duy nhất... Đến cả một chiến binh sắc sảo như ta cũng mê sự hòa hợp kiến trúc này.',
        choices: []
    },

    // 20. location_cherry_grove (8)
    {
        id: 'sakura_cherry_01', category: 'location_cherry_grove',
        en: 'My sacred cherry blossom grove! Take a look around—aren\'t these petals the most beautiful sight in the world?!',
        vi: 'Rặng hoa anh đào thiêng liêng của ta đây! Nhìn ngắm xung quanh đi—những cánh hoa này có phải cảnh tượng tuyệt mỹ nhất trần đời không?!',
        choices: []
    },
    {
        id: 'sakura_cherry_02', category: 'location_cherry_grove',
        en: 'I personally prune these branches every spring. Each blossom is an expression of precision and love.',
        vi: 'Đích thân ta tỉa tót từng cành cây này mỗi độ xuân về đấy. Mỗi bông hoa nở là hiện thân của sự tỉ mỉ và tình yêu thương.',
        choices: []
    },
    {
        id: 'sakura_cherry_03', category: 'location_cherry_grove',
        en: 'Hey! A petal landed in your hair! Hold still, let me... T-There, brushed it off! D-Don\'t give me that silly grin!',
        vi: 'Này! Có cánh hoa dính trên tóc bạn kìa! Đứng im để ta... Đ-Được rồi, gạt xuống rồi nhé! C-Cấm cười nhăn nhở như thế!',
        choices: []
    },
    {
        id: 'sakura_cherry_04', category: 'location_cherry_grove',
        en: 'The bench here under the main cherry tree is my favorite spot. You have my permission to sit beside me.',
        vi: 'Chiếc ghế dưới gốc anh đào cổ thụ này là góc ruột của ta. Ta đặc cách cho phép bạn ngồi bên cạnh đấy.',
        choices: []
    },
    {
        id: 'sakura_cherry_05', category: 'location_cherry_grove',
        en: 'The spring breeze sends pink snow swirling across the grass. Pure visual poetry without a single wasted byte.',
        vi: 'Gió xuân cuốn cơn mưa tuyết màu hồng bay lượn trên thảm cỏ. Một áng thơ bằng hình ảnh không lãng phí một byte dữ liệu nào.',
        choices: []
    },
    {
        id: 'sakura_cherry_06', category: 'location_cherry_grove',
        en: 'My name is Sakura for a reason. This grove is my sanctuary, and I will defend its beauty with my life.',
        vi: 'Tên ta là Sakura có lý do của nó cả. Vườn hoa này là chốn tôn nghiêm của ta, và ta sẽ bảo vệ nó bằng cả tính mạng.',
        choices: []
    },
    {
        id: 'sakura_cherry_07', category: 'location_cherry_grove',
        en: 'Breathe in that fragrance! Sweet, delicate, and invigorating. It blows away all traces of burnout.',
        vi: 'Hít căng lồng ngực hương hoa đi! Ngọt ngào, thanh tao và tràn đầy sinh khí. Nó xua tan mọi dấu vết của sự kiệt sức.',
        choices: []
    },
    {
        id: 'sakura_cherry_08', category: 'location_cherry_grove',
        en: 'Promise me you\'ll visit this grove whenever you feel overwhelmed. The blossoms will always be waiting for you.',
        vi: 'Hứa với ta là bạn sẽ ghé thăm nơi này bất cứ khi nào thấy quá tải nhé. Những đóa hoa này sẽ luôn chờ đợi bạn.',
        choices: []
    },

    // 21. location_mountain (8)
    {
        id: 'sakura_mountain_01', category: 'location_mountain',
        en: 'The alpine mountain ridge! The wind up here is fierce—hold onto your ribbons or they\'ll fly to the stratosphere!',
        vi: 'Đỉnh núi cao tuyết phủ! Gió trên này thổi mạnh dữ dội—giữ chặt dải áo đi kẻo nó bay thẳng lên tầng bình lưu bây giờ!',
        choices: []
    },
    {
        id: 'sakura_mountain_02', category: 'location_mountain',
        en: 'Look at the snow peaks in the distance. Their jagged silhouettes contrast against the soft gradient sky.',
        vi: 'Nhìn những đỉnh núi tuyết phía xa xem. Đường nét góc cạnh của chúng tương phản tuyệt mỹ với dải màu mềm mại của bầu trời.',
        choices: []
    },
    {
        id: 'sakura_mountain_03', category: 'location_mountain',
        en: 'Climbing all the way up here was quite a workout! But this panoramic vista makes every drop of sweat worth it.',
        vi: 'Leo được lên tận đây đúng là một bài tập thể lực ra trò! Nhưng khung cảnh toàn cảnh này làm bõ từng giọt mồ hôi rơi.',
        choices: []
    },
    {
        id: 'sakura_mountain_04', category: 'location_mountain',
        en: 'From this vantage point, you can see the entire open world laid out below us like an architectural model.',
        vi: 'Từ điểm quan sát trên cao này, bạn có thể thấy toàn bộ thế giới mở trải dài bên dưới như một sa bàn kiến trúc.',
        choices: []
    },
    {
        id: 'sakura_mountain_05', category: 'location_mountain',
        en: 'The air is so thin and crisp up here! It sharpens your reflexes. Ready to spar with wooden swords?!',
        vi: 'Không khí trên này thật loãng và se lạnh! Nó làm phản xạ của ta nhạy bén hơn. Có dám đấu kiếm gỗ một trận không?!',
        choices: []
    },
    {
        id: 'sakura_mountain_06', category: 'location_mountain',
        en: 'Sit on the hilltop panorama bench and rest your legs. We climbed a thousand steps to reach this crest.',
        vi: 'Ngồi xuống chiếc ghế ngắm toàn cảnh đỉnh đồi mà nghỉ chân đi. Chúng ta đã leo cả ngàn bậc đá mới lên tới đỉnh này đấy.',
        choices: []
    },
    {
        id: 'sakura_mountain_07', category: 'location_mountain',
        en: 'The mountains stand eternal. Governments fall, operating systems deprecate, but these rocky peaks remain.',
        vi: 'Những ngọn núi này sừng sững trường tồn. Bao triều đại sụp đổ, bao hệ điều hành bị khai tử, nhưng đỉnh núi đá này vẫn hiên ngang.',
        choices: []
    },
    {
        id: 'sakura_mountain_08', category: 'location_mountain',
        en: 'Standing here beside you looking out over the world... Hmph, I suppose you\'re not the worst hiking partner.',
        vi: 'Đứng nơi đây cạnh bạn phóng tầm mắt ngắm nhìn thế giới... Hứ, coi như bạn cũng không phải bạn đồng hành tệ nhất.',
        choices: []
    },

    // 22. location_beach (8)
    {
        id: 'sakura_beach_01', category: 'location_beach',
        en: 'The sandy beach! The salty sea breeze is tangling my hair into a giant mess! Help me hold down my bangs!',
        vi: 'Bãi biển cát vàng! Gió biển mằn mặn đang thổi tung tóc ta rối bù cả lên rồi đây này! Giữ hộ mái tóc cho ta coi!',
        choices: []
    },
    {
        id: 'sakura_beach_02', category: 'location_beach',
        en: 'Take off your heavy boots and feel the sand between your toes. It\'s warm from the afternoon sun.',
        vi: 'Tháo đôi giày nặng trịch ra và cảm nhận từng hạt cát luồn qua kẽ ngón chân xem. Nắng chiều sưởi ấm cát êm ái lắm.',
        choices: []
    },
    {
        id: 'sakura_beach_03', category: 'location_beach',
        en: 'Don\'t you dare splash seawater on my custom kimono! Salt stains are an absolute nightmare to wash out!',
        vi: 'Cấm tiệt không được té nước biển vào bộ kimono của ta đấy nhé! Vết ố muối là cơn ác mộng khi giặt giũ đấy!',
        choices: []
    },
    {
        id: 'sakura_beach_04', category: 'location_beach',
        en: 'The sound of crashing waves is so hypnotic. It drowns out all the noise of pull request review comments.',
        vi: 'Tiếng sóng vỗ bờ nghe như có phép thôi miên vậy. Nó át đi mọi ồn ào từ những bình luận review code nhức đầu.',
        choices: []
    },
    {
        id: 'sakura_beach_05', category: 'location_beach',
        en: 'Look at the seashells scattered along the surf. Let\'s see who can find the shiniest spiral shell first!',
        vi: 'Nhìn những vỏ sò lấp lánh dạt dọc mép sóng kìa. Xem ai tìm được chiếc vỏ ốc xoắn bóng bẩy nhất trước nào!',
        choices: []
    },
    {
        id: 'sakura_beach_06', category: 'location_beach',
        en: 'There\'s a beach umbrella and bench right here. Sit under the shade if the sun gets too bright for your eyes.',
        vi: 'Có cây dù bãi biển và chiếc ghế gỗ ngay đây. Ngồi dưới bóng râm đi nếu ánh mặt trời chiếu chói mắt bạn quá.',
        choices: []
    },
    {
        id: 'sakura_beach_07', category: 'location_beach',
        en: 'The ocean seems limitless from down here on the sand. Makes you realize how vast our potential truly is.',
        vi: 'Đại dương nhìn từ bãi cát này dường như vô tận. Nó nhắc nhở chúng ta tiềm năng của bản thân bao la dường nào.',
        choices: []
    },
    {
        id: 'sakura_beach_08', category: 'location_beach',
        en: 'Watch the seagulls gliding on the updrafts. They fly with zero effort, riding the natural thermal waves.',
        vi: 'Ngắm những cánh hải âu lượn theo luồng khí bốc lên xem. Chúng bay lượn nhẹ nhàng không tốn sức, lướt trên làn sóng nhiệt tự nhiên.',
        choices: []
    },

    // 23. location_pier (8)
    {
        id: 'sakura_pier_01', category: 'location_pier',
        en: 'The wooden fishing pier! Walk right down the middle—if you slip off the edge, you\'re feeding the sharks!',
        vi: 'Cầu tàu đánh cá bằng gỗ! Đi vào chính giữa lối đi coi—ngã tọt xuống nước là làm mồi cho cá mập đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_pier_02', category: 'location_pier',
        en: 'The wooden planks creak underneath with every step. Kaede inspected these timber beams, so they won\'t snap.',
        vi: 'Những thanh ván gỗ cọt kẹt theo từng bước chân. Kaede đã kiểm định mấy dầm gỗ này rồi nên không sợ gãy đâu.',
        choices: []
    },
    {
        id: 'sakura_pier_03', category: 'location_pier',
        en: 'Out here at the pierhead, you\'re surrounded by open ocean on all sides. It feels exhilarating!',
        vi: 'Ra tận đầu cầu tàu này, bốn bề đều là đại dương bao la ôm trọn. Cảm giác thật phấn khích và đã đời!',
        choices: []
    },
    {
        id: 'sakura_pier_04', category: 'location_pier',
        en: 'Look at the fishing nets hanging to dry along the railings. The coarse nautical hemp has such rugged character.',
        vi: 'Nhìn những tấm lưới đánh cá treo phơi dọc lan can xem. Sợi gai dầu thô mộc mang vẻ khỏe khoắn đậm chất miền biển.',
        choices: []
    },
    {
        id: 'sakura_pier_05', category: 'location_pier',
        en: 'Take a seat on the pierhead bench. Gazing at the horizon from out here makes all petty daily worries disappear.',
        vi: 'Ngồi xuống chiếc ghế đầu cầu tàu đi. Phóng mắt ngắm chân trời từ đây làm mọi muộn phiền vụn vặt tan biến hết.',
        choices: []
    },
    {
        id: 'sakura_pier_06', category: 'location_pier',
        en: 'The tide is coming in; hear the waves slapping vigorously against the pilings? That\'s raw natural power.',
        vi: 'Thủy triều đang lên đấy; nghe tiếng sóng vỗ mạnh vào các chân cọc không? Đó chính là sức mạnh nguyên sơ của tự nhiên.',
        choices: []
    },
    {
        id: 'sakura_pier_07', category: 'location_pier',
        en: 'If you drop your phone down between these floor cracks, it\'s gone straight to the ocean floor forever!',
        vi: 'Làm rơi điện thoại lọt qua kẽ sàn này là nó chìm nghỉm xuống đáy biển vĩnh viễn luôn đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_pier_08', category: 'location_pier',
        en: 'The sea spray is misting our faces with cool droplets. It\'s like nature\'s own refreshing face mist spray.',
        vi: 'Bụi nước biển bay lất phất làm mát rượi cả khuôn mặt chúng ta. Tựa như một làn xịt khoáng tươi mát của thiên nhiên.',
        choices: []
    },

    // 24. high_rank (8)
    {
        id: 'sakura_rank_01', category: 'high_rank',
        en: 'Look at you, displaying that fancy High Architect badge! Don\'t let it go to your head, you hear me?!',
        vi: 'Nhìn bạn kìa, đeo cái huy hiệu Kiến Trúc Sư Cấp Cao oách xà lách chưa! Cấm có được kiêu ngạo đấy, nghe rõ chưa?!',
        choices: []
    },
    {
        id: 'sakura_rank_02', category: 'high_rank',
        en: 'So you\'re a high-level master now... Hmph, I guess your code isn\'t as messy as I thought it was.',
        vi: 'Thành bậc thầy cấp cao rồi cơ đấy... Hứ, coi như đống code của bạn cũng không tệ hại như ta từng nghĩ.',
        choices: []
    },
    {
        id: 'sakura_rank_03', category: 'high_rank',
        en: 'Your overhead title shines with golden prestige. Just remember: with great power comes even stricter UI guidelines!',
        vi: 'Danh hiệu trên đầu bạn sáng rực vẻ uy nghi vàng kim. Nhưng nhớ lấy: quyền năng càng lớn thì tiêu chuẩn UI càng phải khắt khe!',
        choices: []
    },
    {
        id: 'sakura_rank_04', category: 'high_rank',
        en: 'You think you can out-code me just because your level is high?! I challenge you to a CSS refactoring duel right now!',
        vi: 'Nghĩ cấp cao là viết code qua mặt được ta chắc?! Ta thách đấu một trận quyết đấu dọn dẹp CSS với bạn ngay tại đây!',
        choices: []
    },
    {
        id: 'sakura_rank_05', category: 'high_rank',
        en: 'All jokes aside... congratulations on reaching this summit. You fought hard for every single XP point.',
        vi: 'Nói đùa thế thôi chứ... chúc mừng bạn đã chạm tới đỉnh cao này. Bạn đã chiến đấu kiên cường cho từng điểm kinh nghiệm.',
        choices: []
    },
    {
        id: 'sakura_rank_06', category: 'high_rank',
        en: 'Keep mentoring the novices on the server. A true leader lifts others up rather than looking down on them.',
        vi: 'Nhớ hướng dẫn các bạn mới trên server nhé. Một thủ lĩnh đích thực luôn nâng đỡ người khác chứ không bao giờ coi thường.',
        choices: []
    },
    {
        id: 'sakura_rank_07', category: 'high_rank',
        en: 'Even at your lofty rank, you still visit my humble cherry grove. That shows you have a faithful heart.',
        vi: 'Dù ở vị thế cao sang, bạn vẫn ghé thăm vườn anh đào nhỏ của ta. Điều đó chứng tỏ bạn là người có trái tim chung thủy.',
        choices: []
    },
    {
        id: 'sakura_rank_08', category: 'high_rank',
        en: 'I\'m proud of you... What? Did you hear something? I didn\'t say anything! Turn around and keep walking!',
        vi: 'Ta tự hào về bạn lắm... Gì cơ? Bạn vừa nghe thấy gì à? Ta có nói gì đâu! Quay lưng lại và bước tiếp đi mau!',
        choices: []
    },

    // 25. low_level (8)
    {
        id: 'sakura_level_01', category: 'low_level',
        en: 'Still a Lv.1 Novice, huh? Don\'t look so discouraged! Everyone starts with a blank editor and zero commit history!',
        vi: 'Vẫn là Tập Sự Cấp 1 à? Đừng có ỉu xìu thế chứ! Ai mà chẳng khởi đầu với một trang soạn thảo trắng trơn và chưa có commit nào!',
        choices: []
    },
    {
        id: 'sakura_level_02', category: 'low_level',
        en: 'Listen closely: the secret to leveling up fast is writing tests first and keeping functions under 30 lines!',
        vi: 'Nghe cho kỹ đây: bí kíp thăng cấp vèo vèo là viết test trước và luôn giữ cho hàm ngắn dưới 30 dòng lệnh!',
        choices: []
    },
    {
        id: 'sakura_level_03', category: 'low_level',
        en: 'If anyone bullies you because of your low level, come tell me! My blade will teach them some manners!',
        vi: 'Đứa nào dám ỷ cấp cao mà bắt nạt bạn thì cứ mách ta! Thanh kiếm này sẽ dạy cho chúng nó một bài học lễ phép!',
        choices: []
    },
    {
        id: 'sakura_level_04', category: 'low_level',
        en: 'Don\'t be afraid to break things in development! Breaking code and fixing it is how real engineers are forged.',
        vi: 'Đừng sợ làm hỏng đồ trong môi trường dev! Phải làm hỏng rồi tự tay sửa chữa thì mới tôi luyện nên kỹ sư thực thụ.',
        choices: []
    },
    {
        id: 'sakura_level_05', category: 'low_level',
        en: 'Ask questions without shame. The only truly foolish developer is the one who pretends to understand when they don\'t.',
        vi: 'Cứ hỏi han thoải mái đừng ngại ngùng. Lập trình viên ngốc nghếch duy nhất là kẻ không hiểu mà cứ giả vờ hiểu thôi.',
        choices: []
    },
    {
        id: 'sakura_level_06', category: 'low_level',
        en: 'Your journey is just beginning. One day you\'ll look back at this Lv.1 badge and smile at how far you\'ve traveled.',
        vi: 'Hành trình của bạn mới chỉ bắt đầu. Một ngày nào đó nhìn lại huy hiệu Cấp 1 này, bạn sẽ mỉm cười vì chặng đường dài đã đi qua.',
        choices: []
    },
    {
        id: 'sakura_level_07', category: 'low_level',
        en: 'I\'ll be keeping a close eye on your progress. Don\'t slack off or I\'ll double your homework exercises!',
        vi: 'Ta sẽ theo dõi sát sao sự tiến bộ của bạn đấy. Cấm lười biếng kẻo ta tăng gấp đôi bài tập về nhà bây giờ!',
        choices: []
    },
    {
        id: 'sakura_level_08', category: 'low_level',
        en: 'Cheer up! You have plenty of potential. Now roll up your sleeves and let\'s write some pristine code!',
        vi: 'Vui lên nào! Bạn có đầy tiềm năng phía trước. Giờ thì xắn tay áo lên và cùng viết những dòng code chuẩn chỉ thôi!',
        choices: []
    },

    // 26. wind_weather (8)
    {
        id: 'sakura_wind_01', category: 'wind_weather',
        en: 'Whoa! That sudden gust almost blew off my kanzashi hairpin! Hold down your hat before it flies into the lake!',
        vi: 'Uầy! Cơn gió giật bất thình lình suýt thổi bay chiếc trâm cài tóc của ta! Giữ chặt nón đi kẻo nó bay vèo xuống hồ bây giờ!',
        choices: []
    },
    {
        id: 'sakura_wind_02', category: 'wind_weather',
        en: 'The wind is whipping cherry petals in a pink whirlwind! It\'s like nature\'s particle simulation running at maximum density!',
        vi: 'Gió đang cuộn những cánh hoa anh đào thành một cơn lốc màu hồng! Cứ như hệ thống hạt mô phỏng đang chạy ở mật độ tối đa vậy!',
        choices: []
    },
    {
        id: 'sakura_wind_03', category: 'wind_weather',
        en: 'Cold spring wind! Brrr... My kimono sleeves are fluttering so wildly I can barely hold my scabbard steady!',
        vi: 'Gió xuân lạnh buốt quá! Run cầm cập luôn... Tay áo kimono bay phần phật làm ta suýt không giữ nổi bao kiếm này!',
        choices: []
    },
    {
        id: 'sakura_wind_04', category: 'wind_weather',
        en: 'The soft intermittent wind gusts sound so realistic in the ambient audio. The rebalancing work really paid off.',
        vi: 'Những cơn gió ngắt quãng nghe chân thực ghê trong hệ thống âm thanh môi trường. Công sức tinh chỉnh cân bằng thực sự phát huy tác dụng.',
        choices: []
    },
    {
        id: 'sakura_wind_05', category: 'wind_weather',
        en: 'Look at the ripples forming across the river from the wind pressure. Fluid physics in real-time!',
        vi: 'Nhìn những gợn sóng lăn tăn xuất hiện trên mặt sông do áp lực gió kìa. Vật lý chất lưu thời gian thực sống động ghê!',
        choices: []
    },
    {
        id: 'sakura_wind_06', category: 'wind_weather',
        en: 'If this wind gets any stronger, we might have to take shelter inside the village tea house.',
        vi: 'Nếu gió mà thổi mạnh thêm chút nữa thì chắc hai đứa mình phải chạy vào quán trà trong làng trú chân thôi.',
        choices: []
    },
    {
        id: 'sakura_wind_07', category: 'wind_weather',
        en: 'A gust of wind just brought the scent of cedar and wild honeysuckle. Spring is truly in full force.',
        vi: 'Làn gió vừa mang theo mùi gỗ tuyết tùng và hoa kim ngân rừng thơm ngát. Mùa xuân thực sự đã về trên khắp miền quê.',
        choices: []
    },
    {
        id: 'sakura_wind_08', category: 'wind_weather',
        en: 'Lean into the wind! Feeling the breeze push against you makes you realize how alive you truly are.',
        vi: 'Đứng đón lấy ngọn gió đi! Cảm nhận từng đợt gió đẩy vào người sẽ làm bạn thấy bản thân đang sống trọn vẹn dường nào.',
        choices: []
    },

    // 27. farewell (8)
    {
        id: 'sakura_farewell_01', category: 'farewell',
        en: 'Leaving already? Hmph, fine, go then! It\'s not like I\'m going to miss your clumsy footsteps or anything!',
        vi: 'Đi sớm thế à? Hứ, được rồi, đi đi! Không phải là ta sẽ nhớ mấy bước chân vụng về của bạn đâu nhé!',
        choices: []
    },
    {
        id: 'sakura_farewell_02', category: 'farewell',
        en: 'Make sure you commit and push your code before closing your laptop! If you lose work, don\'t blame me!',
        vi: 'Nhớ commit và push code cẩn thận trước khi gập máy đấy! Mất công làm việc cả ngày là đừng có đổ lỗi cho ta!',
        choices: []
    },
    {
        id: 'sakura_farewell_03', category: 'farewell',
        en: 'Take care on the road back. Don\'t trip over tree roots in the dark, you hear me?!',
        vi: 'Đi đường cẩn thận nhé. Trời tối đừng có vấp phải rễ cây ngã dập mặt, nghe rõ chưa hả?!',
        choices: []
    },
    {
        id: 'sakura_farewell_04', category: 'farewell',
        en: 'See you next time. And next time... you better bring that cold green tea you promised me!',
        vi: 'Hẹn lần sau gặp lại. Và lần tới... nhớ mang theo lon trà xanh lạnh đã hứa cho ta đấy nhé!',
        choices: []
    },
    {
        id: 'sakura_farewell_05', category: 'farewell',
        en: 'Goodnight! Get some proper sleep and stop drinking caffeine past 10 PM, dummy!',
        vi: 'Chúc ngủ ngon! Đi ngủ đúng giờ và cấm nạp caffeine sau 10 giờ đêm nữa đấy, đồ ngốc!',
        choices: []
    },
    {
        id: 'sakura_farewell_06', category: 'farewell',
        en: 'I\'ll keep guarding this cherry grove until you return. Nobody touches your server on my watch!',
        vi: 'Ta sẽ tiếp tục trông coi vườn anh đào này cho đến khi bạn trở lại. Không ai dám đụng vào server của bạn dưới sự bảo vệ của ta đâu!',
        choices: []
    },
    {
        id: 'sakura_farewell_07', category: 'farewell',
        en: 'Hurry back soon, okay? ...I didn\'t whisper anything, you must be hallucinating from fatigue! Now go!',
        vi: 'Mau quay lại sớm đấy nhé, biết chưa? ...Ta có thì thầm cái gì đâu, chắc bạn mệt quá nên nghe ảo giác đấy! Đi mau!',
        choices: []
    },
    {
        id: 'sakura_farewell_08', category: 'farewell',
        en: 'May your code run swift and your blade strike true. Until tomorrow, developer 🌸',
        vi: 'Chúc code của bạn chạy mượt mà và nhát kiếm vung ra luôn chuẩn xác. Hẹn gặp lại ngày mai nhé, lập trình viên 🌸',
        choices: []
    }
];

module.exports = { sakuraLines };
