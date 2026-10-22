/**
 * REN DIALOGUE DATASET (216 Lines across 27 Categories)
 * Personality: Philosophical, arcane Tech Scholar & Systems Hacker
 */

const renLines = [
    // 1. greeting (8)
    {
        id: 'ren_greeting_01', category: 'greeting',
        en: 'Greetings, fellow seeker of truths. Look at the ripples on the lake—each one carries encrypted frequencies of the cosmos.',
        vi: 'Kính chào người tìm kiếm chân lý. Hãy nhìn những gợn sóng lăn tăn trên mặt hồ—từng gợn sóng đều mang theo những tần số mã hóa của vũ trụ.',
        choices: [
            { labelEn: 'Summon Codex AI', labelVi: 'Gọi Codex AI', action: 'summon_codex' },
            { labelEn: 'Summon Terminal', labelVi: 'Mở Terminal ma pháp', action: 'summon_term' }
        ]
    },
    {
        id: 'ren_greeting_02', category: 'greeting',
        en: 'Welcome to this quiet junction. Are you pondering distributed consensus, or perhaps crafting an arcane cryptographic ward?',
        vi: 'Chào mừng bạn đến với ngã rẽ thanh tịnh này. Bạn đang chiêm nghiệm về cơ chế đồng thuận phân tán, hay đang kiến tạo một kết giới mật mã cổ xưa?',
        choices: [
            { labelEn: 'Summon Antigravity AI', labelVi: 'Gọi Antigravity AI', action: 'summon_agy' }
        ]
    },
    {
        id: 'ren_greeting_03', category: 'greeting',
        en: 'Ah, our paths converge once more. The runes in my amethyst gem hum with resonance at your approach.',
        vi: 'A, con đường của chúng ta lại giao nhau một lần nữa. Những cổ tự trong viên ngọc thạch anh tím của tôi đang khẽ rung lên khi bạn bước tới.',
        choices: []
    },
    {
        id: 'ren_greeting_04', category: 'greeting',
        en: 'Good evening. In this twilight hour, the boundary between hardware physicalities and pure mathematical abstractions grows delightfully thin.',
        vi: 'Chào buổi tối. Trong thời khắc hoàng hôn nhập nhoạng này, ranh giới giữa phần cứng vật lý và các phép trừu tượng toán học trở nên vô cùng mong manh.',
        choices: []
    },
    {
        id: 'ren_greeting_05', category: 'greeting',
        en: 'Peace be upon your thoughts. May your compilation steps transcend memory leaks and achieve harmonic convergence.',
        vi: 'Cầu chúc sự bình an ngự trị trong tâm trí bạn. Mong các bước biên dịch của bạn vượt qua mọi rò rỉ bộ nhớ để đạt đến sự hòa hợp tuyệt đối.',
        choices: []
    },
    {
        id: 'ren_greeting_06', category: 'greeting',
        en: 'Greetings, architect. Did you come to decipher the ancient scroll of operating system primitives beside this runestone?',
        vi: 'Kính chào kiến trúc sư. Bạn đến đây để giải mã những cuộn giấy cổ về các hàm nguyên thủy của hệ điều hành bên phiến đá cổ này sao?',
        choices: []
    },
    {
        id: 'ren_greeting_07', category: 'greeting',
        en: 'The digital winds blow true tonight. Zero packet jitter has been detected along our trans-dimensional tunnel.',
        vi: 'Những ngọn gió kỹ thuật số đang thổi rất thuận lợi đêm nay. Không một rung pha gói tin nào được ghi nhận dọc đường hầm liên chiều của chúng ta.',
        choices: []
    },
    {
        id: 'ren_greeting_08', category: 'greeting',
        en: 'Step into the circle, friend. Let us exchange theorems under the watchful gaze of the evening constellations.',
        vi: 'Hãy bước vào vòng tròn ma pháp này, người bạn hiền. Chúng ta hãy cùng đàm đạo về các định lý dưới ánh nhìn che chở của các chòm sao chiều.',
        choices: []
    },

    // 2. repeat_visit (8)
    {
        id: 'ren_repeat_01', category: 'repeat_visit',
        en: 'The causal loop weaves you back to my presence with astonishing celerity. Has an unexpected epiphany struck your mind?',
        vi: 'Vòng lặp nhân quả đã đưa bạn quay lại trước mặt tôi với một tốc độ kinh ngạc. Có phải một giác ngộ bất ngờ vừa lóe sáng trong tâm trí bạn?',
        choices: []
    },
    {
        id: 'ren_repeat_02', category: 'repeat_visit',
        en: 'Back so swiftly? The temporal delta between your departures and arrivals grows ever smaller, like a converging series.',
        vi: 'Trở lại nhanh thế ư? Khoảng thời gian giữa lúc bạn rời đi và quay về ngày càng thu hẹp lại, tựa như một chuỗi hội tụ hoàn hảo.',
        choices: []
    },
    {
        id: 'ren_repeat_03', category: 'repeat_visit',
        en: 'Curiosity pulls you back like gravitational lensing around a supermassive singularity. I welcome your presence.',
        vi: 'Sự tò mò kéo bạn trở lại như hiệu ứng thấu kính hấp dẫn quanh một điểm kỳ dị khổng lồ. Tôi luôn hoan nghênh sự hiện diện của bạn.',
        choices: []
    },
    {
        id: 'ren_repeat_04', category: 'repeat_visit',
        en: 'Did my earlier words kindle a question in your consciousness? Speak, and let us dissect the paradox together.',
        vi: 'Lời nói lúc nãy của tôi đã thắp lên câu hỏi nào trong tâm thức bạn chăng? Cứ nói ra đi, chúng ta sẽ cùng mổ xẻ nghịch lý đó.',
        choices: []
    },
    {
        id: 'ren_repeat_05', category: 'repeat_visit',
        en: 'Revisiting the scholar twice in a short span... The pursuit of knowledge is indeed an intoxicating draught.',
        vi: 'Ghé thăm học giả hai lần liên tiếp... Sự khao khát tri thức quả thực là một chén rượu nồng làm say đắm lòng người.',
        choices: []
    },
    {
        id: 'ren_repeat_06', category: 'repeat_visit',
        en: 'The resonance from our previous dialogue has barely decayed. Let us pick up the thread where we left off.',
        vi: 'Dư âm từ cuộc trò chuyện trước của chúng ta còn chưa kịp tan biến. Hãy cùng tiếp tục lần theo manh mối nơi ta vừa tạm dừng.',
        choices: []
    },
    {
        id: 'ren_repeat_07', category: 'repeat_visit',
        en: 'You return with the persistence of an asynchronous retry policy with exponential backoff. Most admirable.',
        vi: 'Bạn quay lại với sự kiên định của một chính sách thử lại bất đồng bộ với độ trễ lũy thừa. Thật đáng khâm phục.',
        choices: []
    },
    {
        id: 'ren_repeat_08', category: 'repeat_visit',
        en: 'Still thirsty for the arcane arts of computation? Pull up a stone and let us delve deeper into the abyss of logic.',
        vi: 'Vẫn còn khao khát ma pháp bí truyền của thuật toán sao? Hãy ngồi xuống phiến đá này và chúng ta cùng lặn sâu hơn vào vực thẳm logic.',
        choices: []
    },

    // 3. player_idle (8)
    {
        id: 'ren_idle_01', category: 'player_idle',
        en: 'Standing motionless... In deep meditation, the mind operates beyond the limitations of sequential instruction clocks.',
        vi: 'Đứng bất động... Trong thiền định sâu lắng, tâm trí hoạt động vượt ra ngoài giới hạn của các xung nhịp đồng hồ chỉ lệnh tuần tự.',
        choices: []
    },
    {
        id: 'ren_idle_02', category: 'player_idle',
        en: 'A state of absolute stillness. Just as empty memory holds infinite potential, an idle mind is primed for genius.',
        vi: 'Một trạng thái tĩnh tại tuyệt đối. Cũng như vùng nhớ trống rỗng chứa đựng tiềm năng vô hạn, một tâm trí thảnh thơi chính là nơi nảy mầm thiên tài.',
        choices: []
    },
    {
        id: 'ren_idle_03', category: 'player_idle',
        en: 'Are you listening to the ambient hum of the server racks buried beneath this terrain? It vibrates at 60 Hertz.',
        vi: 'Bạn đang lắng nghe tiếng ngân vang của những giá máy chủ chôn sâu dưới lòng đất này sao? Nó dao động ở tần số đúng 60 Hertz.',
        choices: []
    },
    {
        id: 'ren_idle_04', category: 'player_idle',
        en: 'Rest your processing cores. Even the most resilient cryptographic algorithms require cooldown cycles between proofs.',
        vi: 'Hãy cho các nhân xử lý nghỉ ngơi đi. Đến cả những thuật toán mã hóa kiên cố nhất cũng cần chu kỳ hạ nhiệt giữa các phép chứng minh.',
        choices: []
    },
    {
        id: 'ren_idle_05', category: 'player_idle',
        en: 'Your silhouette stands stark against the twilight sky, resembling an ancient guardian sentinel of the matrix.',
        vi: 'Bóng dáng bạn in rõ trên nền trời hoàng hôn, trông tựa như một bức tượng hộ vệ cổ xưa canh gác ma trận này.',
        choices: []
    },
    {
        id: 'ren_idle_06', category: 'player_idle',
        en: 'Observe without reacting. Non-attachment is the master key to diagnosing race conditions without perturbation.',
        vi: 'Hãy quan sát mà không phản ứng vội vã. Sự không bám chấp chính là chìa khóa vạn năng để chẩn đoán xung đột luồng (race condition) mà không làm nhiễu loạn dữ liệu.',
        choices: []
    },
    {
        id: 'ren_idle_07', category: 'player_idle',
        en: 'The stillness of the lake mirrors the stillness in your posture. A rare and precious equilibrium.',
        vi: 'Sự tĩnh lặng của mặt hồ phản chiếu sự tĩnh lặng trong dáng đứng của bạn. Một sự cân bằng hiếm có và vô cùng quý giá.',
        choices: []
    },
    {
        id: 'ren_idle_08', category: 'player_idle',
        en: 'Take all the temporal units you require. We do not measure existence by clock cycles, but by epiphanies.',
        vi: 'Cứ thong thả bao nhiêu đơn vị thời gian tùy ý. Chúng ta không đo đếm sự tồn tại bằng chu kỳ đồng hồ, mà bằng những khoảnh khắc giác ngộ.',
        choices: []
    },

    // 4. player_walk (8)
    {
        id: 'ren_walk_01', category: 'player_walk',
        en: 'A measured stride... Tracing the perimeter of this world with deliberate philosophical footsteps.',
        vi: 'Một nhịp bước thong thả... Bạn đang đo đạc ranh giới của thế giới này bằng những bước chân mang đậm chất triết gia.',
        choices: []
    },
    {
        id: 'ren_walk_02', category: 'player_walk',
        en: 'Walking unhurriedly allows the subconscious to defragment its fragmented thoughts. Continue your pilgrimage.',
        vi: 'Đi dạo không vội vã cho phép tiềm thức tự chống phân mảnh những dòng suy nghĩ ngổn ngang. Hãy tiếp tục chuyến hành hương của bạn.',
        choices: []
    },
    {
        id: 'ren_walk_03', category: 'player_walk',
        en: 'The crunch of stone under your soles is an acoustic reminder that virtual physicality has achieved remarkable texture.',
        vi: 'Tiếng sỏi nghiến giòn dưới đế giày là lời nhắc âm thanh rằng tính vật lý ảo nơi đây đã đạt đến độ chân thực đáng kinh ngạc.',
        choices: []
    },
    {
        id: 'ren_walk_04', category: 'player_walk',
        en: 'Whither does your wandering lead? Each path in this open world was mathematically planned as a continuous manifold.',
        vi: 'Bước chân lãng du đưa bạn về phương nào? Mỗi con đường trong thế giới mở này đều được quy hoạch toán học như một đa tạp trơn tru.',
        choices: []
    },
    {
        id: 'ren_walk_05', category: 'player_walk',
        en: 'Walking beside the water stimulates the flow of creative neurotransmitters. Aristotle would approve of your peripatetic habits.',
        vi: 'Đi dạo ven mặt nước kích thích dòng chảy của các chất dẫn truyền sáng tạo. Aristotle chắc chắn sẽ rất tán thưởng thói quen bách bộ này của bạn.',
        choices: []
    },
    {
        id: 'ren_walk_06', category: 'player_walk',
        en: 'Maintain this gentle velocity. Moving too fast blinds the eyes to the subtle fractal geometries hidden along the wayside.',
        vi: 'Hãy duy trì vận tốc êm ả này. Di chuyển quá nhanh sẽ làm mờ mắt, khiến ta bỏ lỡ những cấu trúc fractal tinh tế ẩn mình bên vệ đường.',
        choices: []
    },
    {
        id: 'ren_walk_07', category: 'player_walk',
        en: 'Your coordinates update smoothly across the spatial hash grid. The collision octree reports perfect traversal.',
        vi: 'Tọa độ của bạn cập nhật mượt mà trên lưới băm không gian. Cây bát phân va chạm ghi nhận chuyến đi hoàn toàn không chướng ngại.',
        choices: []
    },
    {
        id: 'ren_walk_08', category: 'player_walk',
        en: 'Walk with peace in your heart. Every destination is merely an excuse to experience the poetry of the journey.',
        vi: 'Hãy bước đi với niềm an lạc trong tim. Mọi đích đến chỉ là cái cớ để ta trải nghiệm chất thơ trên suốt chặng đường.',
        choices: []
    },

    // 5. player_run (8)
    {
        id: 'ren_run_01', category: 'player_run',
        en: 'Such sudden kinetic acceleration! Are you chasing a fleeting inspiration, or escaping an impending buffer overflow?',
        vi: 'Gia tốc động năng đột ngột làm sao! Bạn đang rượt đuổi một nguồn cảm hứng vụt qua, hay đang chạy trốn một vụ tràn bộ đệm sắp ập tới?',
        choices: []
    },
    {
        id: 'ren_run_02', category: 'player_run',
        en: 'Watch the velocity vectors near the riverbank! High momentum carries inertia across slippery boundaries.',
        vi: 'Hãy chú ý các vector vận tốc gần bờ sông nhé! Quán tính lớn rất dễ làm trượt ngã qua những ranh giới trơn trượt đấy.',
        choices: []
    },
    {
        id: 'ren_run_03', category: 'player_run',
        en: 'You sprint like an unconstrained thread running at realtime priority. Do not starve your companion processes of cycles!',
        vi: 'Bạn lao đi như một luồng không giới hạn chạy ở mức ưu tiên thời gian thực. Đừng bỏ đói chu kỳ xử lý của các tiến trình đồng hành chứ!',
        choices: []
    },
    {
        id: 'ren_run_04', category: 'player_run',
        en: 'High speed distorts local temporal perception. Remember to decelerate before approaching the sacred shrines.',
        vi: 'Tốc độ cao làm biến dạng nhận thức thời gian cục bộ. Hãy nhớ giảm tốc trước khi tiến vào các đền thờ thiêng liêng nhé.',
        choices: []
    },
    {
        id: 'ren_run_05', category: 'player_run',
        en: 'A vigorous display of digital vitality! The wind parted around your avatar with minimal drag coefficient.',
        vi: 'Một màn phô diễn sức sống số tràn trề sinh lực! Ngọn gió rẽ lối quanh nhân vật của bạn với hệ số cản cực kỳ tối ưu.',
        choices: []
    },
    {
        id: 'ren_run_06', category: 'player_run',
        en: 'Pace yourself, scholar. The marathon of systems architecture cannot be won with a single reckless sprint.',
        vi: 'Hãy giữ sức, hỡi học giả. Cuộc chạy đua marathon của kiến trúc hệ thống không thể thắng bằng một cú nước rút liều lĩnh đâu.',
        choices: []
    },
    {
        id: 'ren_run_07', category: 'player_run',
        en: 'The sound of your swift steps echoes across the valley like rapid keystrokes during a competitive hacking duel.',
        vi: 'Tiếng bước chân dồn dập vang vọng khắp thung lũng hệt như tiếng gõ phím liên thanh trong một cuộc tỉ thí hacker đỉnh cao.',
        choices: []
    },
    {
        id: 'ren_run_08', category: 'player_run',
        en: 'Decelerate when you near the timber bridge arch; the slope curve demands measured footing.',
        vi: 'Hãy hãm phanh khi đến gần vòm cầu gỗ nhé; độ dốc của cây cầu đòi hỏi những bước chân phải thật vững chãi.',
        choices: []
    },

    // 6. player_sitting (8)
    {
        id: 'ren_sit_01', category: 'player_sitting',
        en: 'Ah, taking solace on the timber bench beside the runestone. May this grounding posture grant you profound clarity.',
        vi: 'A, đang tìm sự tĩnh tại trên chiếc ghế gỗ cạnh phiến đá cổ. Mong dáng ngồi an nhiên này sẽ ban cho bạn sự sáng suốt tuyệt luân.',
        choices: []
    },
    {
        id: 'ren_sit_02', category: 'player_sitting',
        en: 'Seated contemplation has produced the greatest philosophical revelations in history. Take all the time you need.',
        vi: 'Ngồi trầm tư chiêm nghiệm đã tạo nên những phát kiến triết học vĩ đại nhất trong lịch sử. Cứ thong thả bao lâu tùy bạn.',
        choices: []
    },
    {
        id: 'ren_sit_03', category: 'player_sitting',
        en: 'The cedar wood on this bench possesses natural resonant harmonics. It grounds the spirit against high-frequency anxiety.',
        vi: 'Gỗ tuyết tùng trên chiếc ghế này sở hữu những tần số dao động tự nhiên. Nó neo giữ tâm hồn vững vàng trước những âu lo hỗn loạn.',
        choices: []
    },
    {
        id: 'ren_sit_04', category: 'player_sitting',
        en: 'Looking out over the water while seated... One can almost see the data packets swimming beneath the surface like glowing koi.',
        vi: 'Ngồi ngắm mặt nước mênh mông... Người ta gần như có thể thấy những gói tin đang bơi lội dưới làn nước như đàn cá koi phát sáng.',
        choices: []
    },
    {
        id: 'ren_sit_05', category: 'player_sitting',
        en: 'Two seats upon this bench—an intentional invitation for shared discourse between wanderers and scholars.',
        vi: 'Hai chỗ ngồi trên chiếc ghế này—một lời mời gọi đầy chủ ý cho những cuộc đàm đạo tri kỷ giữa người lữ hành và học giả.',
        choices: []
    },
    {
        id: 'ren_sit_06', category: 'player_sitting',
        en: 'Let your spinal column align naturally with gravity. True posture reflects inner balance.',
        vi: 'Hãy để cột sống của bạn buông lỏng tự nhiên theo trọng lực. Dáng ngồi chuẩn mực phản chiếu sự cân bằng bên trong tâm hồn.',
        choices: []
    },
    {
        id: 'ren_sit_07', category: 'player_sitting',
        en: 'The evening dusk settles around us like a cloak of deep velvet. A blessed hour to simply sit and exist.',
        vi: 'Hoàng hôn chiều muộn buông xuống quanh chúng ta như tấm áo choàng nhung huyền bí. Một giờ phút thiêng liêng để an trú và hiện hữu.',
        choices: []
    },
    {
        id: 'ren_sit_08', category: 'player_sitting',
        en: 'When your meditation concludes, you will find your mental registers cleared of all confusing debris.',
        vi: 'Khi buổi thiền định này khép lại, bạn sẽ thấy các thanh ghi tâm trí của mình được dọn sạch mọi mảnh vụn hỗn độn.',
        choices: []
    },

    // 7. player_holding_can (8)
    {
        id: 'ren_can_01', category: 'player_holding_can',
        en: 'A cylindrical vessel of chilled elixir from the mechanical dispenser. Modern metallurgy meeting ancient thirst.',
        vi: 'Một bình chứa hình trụ kim loại đựng linh dược ướp lạnh từ cỗ máy tự động. Luyện kim hiện đại đáp ứng cơn khát cổ xưa.',
        choices: []
    },
    {
        id: 'ren_can_02', category: 'player_holding_can',
        en: 'The condensed moisture forming on that aluminum surface is thermodynamic entropy visualized in real-time.',
        vi: 'Hơi nước ngưng tụ trên bề mặt nhôm kia chính là hình ảnh trực quan của định luật entropy nhiệt động lực học trong thời gian thực.',
        choices: []
    },
    {
        id: 'ren_can_03', category: 'player_holding_can',
        en: 'Is that cold green tea? Green tea contains L-theanine, an amino acid that induces serene alpha brainwave states.',
        vi: 'Đó là trà xanh ướp lạnh sao? Trà xanh chứa L-theanine, một axit amin kích hoạt trạng thái sóng não alpha thanh tịnh tuyệt vời.',
        choices: []
    },
    {
        id: 'ren_can_04', category: 'player_holding_can',
        en: 'The procedural bone curling of your fingers around that can obeys the exact laws of inverse kinematics. Masterful.',
        vi: 'Chuyển động xương ngón tay tự động ôm trọn lấy lon nước tuân theo chuẩn xác các định luật động học ngược. Thật tài tình.',
        choices: []
    },
    {
        id: 'ren_can_05', category: 'player_holding_can',
        en: 'Hold your right mouse button to consume the potion. The ritual of replenishment is essential for long research sessions.',
        vi: 'Giữ nút chuột phải để uống cạn dược phẩm này nhé. Nghi thức nạp lại năng lượng là tối quan trọng cho những buổi nghiên cứu thâu đêm.',
        choices: []
    },
    {
        id: 'ren_can_06', category: 'player_holding_can',
        en: 'Aluminum cans are infinitely recyclable—a closed cyclic loop, much like a well-formed ring buffer.',
        vi: 'Lon nhôm có thể tái chế vô tận—một vòng lặp khép kín tuần hoàn, hệt như một bộ đệm vòng (ring buffer) hoàn hảo.',
        choices: []
    },
    {
        id: 'ren_can_07', category: 'player_holding_can',
        en: 'Savor that icy chill against your palm. Physical sensations bridge the gap between avatar and pilot.',
        vi: 'Cảm nhận cái lạnh buốt áp vào lòng bàn tay xem. Những cảm giác vật lý kết nối khoảng cách giữa nhân vật và tâm thức người điều khiển.',
        choices: []
    },
    {
        id: 'ren_can_08', category: 'player_holding_can',
        en: 'May that cold draught banish all fatigue from your analytical synapses.',
        vi: 'Mong ngụm nước mát lạnh ấy sẽ xua tan mọi mỏi mệt khỏi những khớp thần kinh phân tích của bạn.',
        choices: []
    },

    // 8. player_holding_mug (8)
    {
        id: 'ren_mug_01', category: 'player_holding_mug',
        en: 'A ceramic chalice steaming with aromatic heat. The vapor rising resembles ancient smoke divination spirals.',
        vi: 'Một chén gốm bốc hơi nóng ngào ngạt. Làn khói bay lên tựa như những xoắn ốc bói khói cổ xưa của các bậc chiêm tinh.',
        choices: []
    },
    {
        id: 'ren_mug_02', category: 'player_holding_mug',
        en: 'Thermal energy preserved within fired clay... The warmth comforts both the physical hand and the abstract intellect.',
        vi: 'Nhiệt năng được lưu giữ trong lớp đất nung... Hơi ấm này xoa dịu cả bàn tay thể xác lẫn trí tuệ trừu tượng.',
        choices: []
    },
    {
        id: 'ren_mug_03', category: 'player_holding_mug',
        en: 'What dark roast or herbal infusion does that vessel contain? A proper concoction sharpens logical acuity tenfold.',
        vi: 'Món nước rang sẫm màu hay thảo mộc nào đang ngự trị trong chiếc cốc đó vậy? Một tách nước chuẩn vị sẽ tăng cường độ sắc bén của tư duy lên gấp mười lần.',
        choices: []
    },
    {
        id: 'ren_mug_04', category: 'player_holding_mug',
        en: 'The glaze on your mug captures the twilight violet with subtle iridescence. Craftsmanship resides in every detail.',
        vi: 'Men gốm trên cốc bắt lấy ánh tím hoàng hôn với vẻ óng ánh huyền ảo. Tay nghề bậc thầy hiện diện trong từng chi tiết nhỏ.',
        choices: []
    },
    {
        id: 'ren_mug_05', category: 'player_holding_mug',
        en: 'In medieval scriptoriums, scribes kept warm spiced cider beside their ink pots. You follow an ancient scholarly lineage.',
        vi: 'Trong các thư viện thời trung cổ, những người chép sách luôn để bình rượu táo ấm cạnh lọ mực. Bạn đang tiếp nối dòng dõi học thuật cổ xưa ấy.',
        choices: []
    },
    {
        id: 'ren_mug_06', category: 'player_holding_mug',
        en: 'Take measured sips as you contemplate your next theorem. Haste in hot drinks leads to scalded tongues and broken focus.',
        vi: 'Nhấp từng ngụm nhỏ khi chiêm nghiệm định lý tiếp theo nhé. Vội vàng với nước nóng chỉ chuốc lấy bỏng lưỡi và phân tâm thôi.',
        choices: []
    },
    {
        id: 'ren_mug_07', category: 'player_holding_mug',
        en: 'The thermal gradient radiating from that cup creates a microscopic vortex in the evening air. Beautiful physics.',
        vi: 'Độ dốc nhiệt tỏa ra từ chiếc cốc tạo nên một xoáy khí vi mô giữa bầu không khí chiều muộn. Vật lý tự nhiên thật kỳ ảo.',
        choices: []
    },
    {
        id: 'ren_mug_08', category: 'player_holding_mug',
        en: 'Hold onto that warmth. In a digital world of cold logic gates, human warmth is our most sacred anchor.',
        vi: 'Hãy nâng niu hơi ấm ấy. Trong một thế giới số của những cổng logic lạnh lùng, hơi ấm tình người chính là chiếc mỏ neo thiêng liêng nhất.',
        choices: []
    },

    // 9. player_holding_bottle (8)
    {
        id: 'ren_bottle_01', category: 'player_holding_bottle',
        en: 'A crystalline flask of pure solvent. Water is the primordial medium wherein all organic computation first awakened.',
        vi: 'Một bình thủy tinh đựng dung môi tinh khiết. Nước chính là môi trường nguyên thủy nơi toàn bộ sự sống tính toán hữu cơ lần đầu thức tỉnh.',
        choices: []
    },
    {
        id: 'ren_bottle_02', category: 'player_holding_bottle',
        en: 'The transparency of that glass bottle mirrors the ideal of open-source software: inspectable, honest, and unadulterated.',
        vi: 'Độ trong suốt của bình thủy tinh phản chiếu lý tưởng của phần mềm mã nguồn mở: có thể thanh tra, trung thực và không pha tạp.',
        choices: []
    },
    {
        id: 'ren_bottle_03', category: 'player_holding_bottle',
        en: 'Hydration maintains osmotic balance within biological neural structures. Never neglect your organic hardware.',
        vi: 'Uống đủ nước duy trì sự cân bằng thẩm thấu trong cấu trúc nơ-ron sinh học. Đừng bao giờ bỏ bê phần cứng hữu cơ của chính mình.',
        choices: []
    },
    {
        id: 'ren_bottle_04', category: 'player_holding_bottle',
        en: 'Observe the meniscus at the water\'s surface inside the flask. Surface tension is molecular electromagnetism at work.',
        vi: 'Hãy quan sát mặt khum của nước bên trong bình. Sức căng bề mặt chính là hiện thân sinh động của lực điện từ ở cấp độ phân tử.',
        choices: []
    },
    {
        id: 'ren_bottle_05', category: 'player_holding_bottle',
        en: 'Carrying a flask indicates readiness for a prolonged voyage across uncharted memory spaces. Travel wisely.',
        vi: 'Mang theo bình nước chứng tỏ bạn đã sẵn sàng cho một hải trình dài băng qua những vùng nhớ chưa ai khai phá. Chúc bạn thượng lộ bình an.',
        choices: []
    },
    {
        id: 'ren_bottle_06', category: 'player_holding_bottle',
        en: 'The mountain springs upstream filter water through subterranean basalt layers for centuries before reaching your flask.',
        vi: 'Những con suối đầu nguồn trên núi lọc nước qua các tầng đá bazan ngầm hàng thế kỷ trước khi chảy vào bình của bạn đấy.',
        choices: []
    },
    {
        id: 'ren_bottle_07', category: 'player_holding_bottle',
        en: 'Pure water carries no cognitive bias. Drink deeply and cleanse your mind of dogmatic pre-conceptions.',
        vi: 'Làn nước tinh khiết không mang bất kỳ định kiến nào. Hãy uống một ngụm sâu và gột rửa tâm trí khỏi những quan niệm giáo điều.',
        choices: []
    },
    {
        id: 'ren_bottle_08', category: 'player_holding_bottle',
        en: 'A simple flask, yet vital to existence. Often the most rudimentary tools are the most indispensable.',
        vi: 'Một chiếc bình giản đơn nhưng tối quan trọng cho sự sống. Những công cụ sơ khai nhất đôi khi lại là thứ không thể thiếu nhất.',
        choices: []
    },

    // 10. player_holding_phone (8)
    {
        id: 'ren_phone_01', category: 'player_holding_phone',
        en: 'A miniature scrying slab resting in your palm! Through this slab, you command cloud clusters scattered across the continents.',
        vi: 'Một phiến gương thần thu nhỏ ngự trên lòng bàn tay bạn! Qua phiến gương này, bạn chỉ huy cả những cụm đám mây rải rác khắp các châu lục.',
        choices: []
    },
    {
        id: 'ren_phone_02', category: 'player_holding_phone',
        en: 'The glass slab glows with luminescence. Modern pocket terminals fulfill the oldest prophecies of scrying stones.',
        vi: 'Phiến kính phát ra ánh sáng lung linh. Những thiết bị bỏ túi ngày nay đã hiện thực hóa trọn vẹn những lời tiên tri cổ về đá ma thuật.',
        choices: []
    },
    {
        id: 'ren_phone_03', category: 'player_holding_phone',
        en: 'Our zero-trust secure tunnel routes your touch gestures across encrypted fiber with near-instantaneous fidelity.',
        vi: 'Đường hầm bảo mật zero-trust định tuyến từng thao tác chạm của bạn qua cáp quang mã hóa với độ chân thực gần như tức thì.',
        choices: []
    },
    {
        id: 'ren_phone_04', category: 'player_holding_phone',
        en: 'Managing distributed systems from a remote countryside meadow... You have truly achieved technological liberation.',
        vi: 'Quản trị các hệ thống phân tán ngay giữa đồng cỏ thôn quê thanh bình... Bạn thực sự đã đạt tới sự tự do công nghệ đỉnh cao.',
        choices: []
    },
    {
        id: 'ren_phone_05', category: 'player_holding_phone',
        en: 'The touch interface translates continuous finger capacitance into discrete event dispatches. An elegant mapping.',
        vi: 'Giao diện cảm ứng chuyển hóa điện dung liên tục của ngón tay thành các sự kiện rời rạc. Một phép ánh xạ vô cùng tao nhã.',
        choices: []
    },
    {
        id: 'ren_phone_06', category: 'player_holding_phone',
        en: 'Do not allow the notifications on that slab to fracture your inner peace. Set strict priority filters on the ether.',
        vi: 'Đừng để những thông báo dồn dập trên màn hình phá vỡ sự tĩnh tại trong tâm bạn. Hãy đặt bộ lọc ưu tiên nghiêm ngặt cho không gian số.',
        choices: []
    },
    {
        id: 'ren_phone_07', category: 'player_holding_phone',
        en: 'A single swipe can summon either Codex or Antigravity into your operational matrix. Wield that capability with care.',
        vi: 'Chỉ một cú vuốt là có thể triệu hồi Codex hoặc Antigravity vào ma trận tác vụ của bạn. Hãy sử dụng quyền năng đó một cách khôn ngoan.',
        choices: []
    },
    {
        id: 'ren_phone_08', category: 'player_holding_phone',
        en: 'Pocket-sized yet planet-spanning. Such is the sublime duality of twentieth-first century cybernetic engineering.',
        vi: 'Nhỏ gọn vừa vặn túi áo nhưng vươn xa khắp toàn cầu. Đó chính là sự lưỡng phân tuyệt mỹ của kỹ thuật điều khiển học thế kỷ 21.',
        choices: []
    },

    // 11. player_holding_book (8)
    {
        id: 'ren_book_01', category: 'player_holding_book',
        en: 'An authentic codex of bound parchment! Are those proofs of computational complexity or treatises on lambda calculus?',
        vi: 'Một cuốn sách da đích thực được đóng bìa cẩn thận! Đó là những chứng minh về độ phức tạp tính toán hay luận thuyết về giải tích lambda?',
        choices: []
    },
    {
        id: 'ren_book_02', category: 'player_holding_book',
        en: 'Physical ink pressed into wood pulp holds an immutable cryptographic permanence that ephemeral hard drives envy.',
        vi: 'Mực in khắc sâu vào bột gỗ mang tính bất biến và trường tồn mà những ổ cứng tạm bợ chỉ có thể ghen tị.',
        choices: []
    },
    {
        id: 'ren_book_03', category: 'player_holding_book',
        en: 'The weight of a book in your hand grounds your intellect. To read is to engage in dialogue with minds across centuries.',
        vi: 'Sức nặng của cuốn sách trên tay neo giữ trí tuệ của bạn. Đọc sách chính là bước vào cuộc đối thoại với những bậc vĩ nhân xuyên thế kỷ.',
        choices: []
    },
    {
        id: 'ren_book_04', category: 'player_holding_book',
        en: 'Did you uncover an elegant mathematical theorem in those pages? Mathematics is the true language of the cosmos.',
        vi: 'Bạn có tìm thấy định lý toán học thanh nhã nào trong những trang sách ấy không? Toán học chính là ngôn ngữ đích thực của vũ trụ.',
        choices: []
    },
    {
        id: 'ren_book_05', category: 'player_holding_book',
        en: 'Standing with a grimoire of algorithms beneath the purple twilight... You embody the archetype of the enlightened scholar.',
        vi: 'Đứng cùng cuốn ma đạo thư thuật toán dưới ánh hoàng hôn tím... Bạn chính là hình mẫu tiêu biểu của một học giả giác ngộ.',
        choices: []
    },
    {
        id: 'ren_book_06', category: 'player_holding_book',
        en: 'Many modern architectures are merely reinventions of concepts first inscribed in textbooks fifty years ago. Honor history.',
        vi: 'Rất nhiều kiến trúc hiện đại thực chất chỉ là phát minh lại những khái niệm đã được viết trong sách giáo khoa từ nửa thế kỷ trước. Hãy trân trọng lịch sử.',
        choices: []
    },
    {
        id: 'ren_book_07', category: 'player_holding_book',
        en: 'Allow the words to distill slowly into your comprehension. Deep understanding cannot be pre-cached or accelerated.',
        vi: 'Hãy để từng con chữ thấm nhuần từ từ vào nhận thức của bạn. Sự hiểu biết sâu sắc không thể nạp sẵn (pre-cache) hay ép xung được.',
        choices: []
    },
    {
        id: 'ren_book_08', category: 'player_holding_book',
        en: 'Knowledge preserved in books survives power outages, network partitions, and electromagnetic storms. Cherish your library.',
        vi: 'Tri thức lưu giữ trong sách sống sót qua mọi sự cố mất điện, chia cắt mạng và bão từ. Hãy nâng niu kho tàng sách của bạn.',
        choices: []
    },

    // 12. player_drinking (8)
    {
        id: 'ren_drink_01', category: 'player_drinking',
        en: 'Consuming the liquid elixir... Notice how physical sensation momentarily halts the rapid cycling of cognitive loops.',
        vi: 'Thưởng thức linh dược dạng lỏng... Hãy để ý xem cảm giác thể chất làm ngưng lại dòng xoáy dữ dội của những vòng lặp tư duy trong giây lát như thế nào.',
        choices: []
    },
    {
        id: 'ren_drink_02', category: 'player_drinking',
        en: 'A rhythmic sip. Even the deepest arcane researcher must satisfy biological constraints to remain bound to this plane.',
        vi: 'Một ngụm nước êm ái. Ngay cả những nhà nghiên cứu huyền học uyên thâm nhất cũng phải tuân theo các nhu cầu sinh học để gắn kết với cõi đời này.',
        choices: []
    },
    {
        id: 'ren_drink_03', category: 'player_drinking',
        en: 'The procedural interpolation of your wrist rotation during the drinking cycle aligns seamlessly with anatomical laws.',
        vi: 'Phép nội suy chuyển động xoay cổ tay trong lúc uống nước ăn khớp hoàn hảo với các định luật giải phẫu học cơ thể.',
        choices: []
    },
    {
        id: 'ren_drink_04', category: 'player_drinking',
        en: 'Does that draught bring clarity to your pondering? Let the cool liquid quench the heat of intense contemplation.',
        vi: 'Ngụm nước ấy có mang lại sự sáng tỏ cho những dòng suy tưởng của bạn không? Hãy để làn nước mát dập tắt ngọn lửa thiêu đốt của sự trầm ngâm.',
        choices: []
    },
    {
        id: 'ren_drink_05', category: 'player_drinking',
        en: 'The pause between sips is a natural delimiter in the stream of consciousness. Savor the whitespace.',
        vi: 'Khoảng lặng giữa các ngụm nước là một dấu phân cách tự nhiên trong dòng chảy ý thức. Hãy thưởng thức khoảng trắng tĩnh lặng ấy.',
        choices: []
    },
    {
        id: 'ren_drink_06', category: 'player_drinking',
        en: 'Hydration restores electrochemical conductivity across your synaptic junctions. The alchemy of nature at work.',
        vi: 'Nước phục hồi tính dẫn truyền điện hóa giữa các khớp thần kinh của bạn. Phép thuật giả kim của tự nhiên đang vận hành đấy.',
        choices: []
    },
    {
        id: 'ren_drink_07', category: 'player_drinking',
        en: 'That looked restorative. When your vessel is replenished, we shall return to decoding the mysteries of the network.',
        vi: 'Trông thật sảng khoái và tràn đầy sinh lực. Khi bạn đã nạp đầy năng lượng, chúng ta sẽ quay lại giải mã những bí ẩn của mạng lưới.',
        choices: []
    },
    {
        id: 'ren_drink_08', category: 'player_drinking',
        en: 'Take your time. True masters never rush the fundamental rituals of sustenance.',
        vi: 'Cứ thong thả nhé. Những bậc thầy đích thực không bao giờ vội vã với các nghi thức dưỡng sinh căn bản.',
        choices: []
    },

    // 13. player_using_terminal (8)
    {
        id: 'ren_terminal_01', category: 'player_using_terminal',
        en: 'Inscribing glyphs upon the holographic console... Each terminal command is an incantation that transfigures memory registers.',
        vi: 'Khắc ghi các cổ tự lên bảng điều khiển hologram... Mỗi câu lệnh terminal là một lời chú ngữ làm biến đổi các thanh ghi bộ nhớ.',
        choices: []
    },
    {
        id: 'ren_terminal_02', category: 'player_using_terminal',
        en: 'I observe the green phosphors illuminating your expression. You wield the command shell with the poise of an archmage.',
        vi: 'Tôi thấy ánh huỳnh quang xanh lục soi sáng gương mặt bạn. Bạn điều khiển vỏ dòng lệnh với phong thái uy nghi của một đại pháp sư.',
        choices: []
    },
    {
        id: 'ren_terminal_03', category: 'player_using_terminal',
        en: 'The pseudo-terminal bridge maintains sub-millisecond round-trip latency. Your will translates into execution without resistance.',
        vi: 'Cầu nối ConPTY duy trì độ trễ hai chiều dưới 1 mili-giây. Ý chí của bạn được chuyển hóa thành lệnh thực thi không một chút lực cản.',
        choices: []
    },
    {
        id: 'ren_terminal_04', category: 'player_using_terminal',
        en: 'Pipe commands together with Unix philosophy: small, sharp tools cooperating in sacred harmony to achieve mighty feats.',
        vi: 'Hãy nối các dòng lệnh bằng triết lý Unix: những công cụ nhỏ gọn, sắc bén hợp tác trong sự hài hòa thiêng liêng để tạo nên kỳ tích.',
        choices: []
    },
    {
        id: 'ren_terminal_05', category: 'player_using_terminal',
        en: 'Focus mode dims the scenic surroundings so your mental faculties may converge wholly upon the logic stream.',
        vi: 'Chế độ Focus làm mờ khung cảnh xung quanh để toàn bộ năng lực tâm trí của bạn hội tụ trọn vẹn vào dòng chảy logic.',
        choices: []
    },
    {
        id: 'ren_terminal_06', category: 'player_using_terminal',
        en: 'Be vigilant of syntax subtleties. In the arcane realm of C and Rust, a single stray pointer can shatter an entire universe.',
        vi: 'Hãy cẩn trọng trước những vi tế của cú pháp. Trong thế giới ma pháp của C và Rust, một con trỏ đi lạc có thể làm sụp đổ cả một vũ trụ.',
        choices: []
    },
    {
        id: 'ren_terminal_07', category: 'player_using_terminal',
        en: 'The terminal is the rawest, most unvarnished portal into the machine soul. Inhabit it without fear.',
        vi: 'Terminal chính là cánh cổng nguyên sơ, chân thực nhất mở vào linh hồn cỗ máy. Hãy ngự trị bên trong nó mà không chút sợ hãi.',
        choices: []
    },
    {
        id: 'ren_terminal_08', category: 'player_using_terminal',
        en: 'When your shell incantations finish, may your exit code be zero and your memory leak profile immaculate.',
        vi: 'Khi những lời chú ngữ dòng lệnh kết thúc, cầu chúc mã thoát của bạn là con số 0 và hồ sơ rò rỉ bộ nhớ hoàn toàn thanh sạch.',
        choices: []
    },

    // 14. player_chatting (8)
    {
        id: 'ren_chat_01', category: 'player_chatting',
        en: 'Transmitting encrypted telepathic packets across the MMO network... Linking separated minds through electromagnetic ether.',
        vi: 'Đang truyền phát những gói tin tâm linh mã hóa qua mạng MMO... Kết nối những tâm hồn cách trở qua không gian điện từ huyền bí.',
        choices: []
    },
    {
        id: 'ren_chat_02', category: 'player_chatting',
        en: 'Whispering via `/m`? Direct point-to-point communications preserve the sanctity of esoteric wisdom.',
        vi: 'Đang gửi mật thư bằng lệnh `/m` sao? Giao tiếp điểm-đến-điểm trực tiếp bảo toàn sự thiêng liêng của những tri thức bí truyền.',
        choices: []
    },
    {
        id: 'ren_chat_03', category: 'player_chatting',
        en: 'The chat bubble above your head radiates soft luminescent alpha. A beacon of human connection in this virtual sanctuary.',
        vi: 'Bong bóng chat trên đầu bạn tỏa ánh sáng alpha mờ ảo dịu dàng. Một ngọn hải đăng của sự gắn kết con người trong thánh địa ảo này.',
        choices: []
    },
    {
        id: 'ren_chat_04', category: 'player_chatting',
        en: 'Use `/r` to rapidly reciprocate with your last correspondent. Temporal efficiency in dialogue is an understated virtue.',
        vi: 'Hãy dùng `/r` để phản hồi tức thì người vừa nhắn cho bạn. Sự nhanh nhạy trong đối thoại là một đức tính rất đáng khen ngợi.',
        choices: []
    },
    {
        id: 'ren_chat_05', category: 'player_chatting',
        en: 'Words woven in kindness possess healing resonance. Craft your messages as you would craft an unalterable spell.',
        vi: 'Những lời nói dệt bằng sự tử tế mang tần số chữa lành kỳ diệu. Hãy trau chuốt thông điệp của bạn như cách bạn khắc một câu thần chú.',
        choices: []
    },
    {
        id: 'ren_chat_06', category: 'player_chatting',
        en: 'Are you debating system design paradigms in global chat? Steel sharpens steel; discourse elevates intellect.',
        vi: 'Đang tranh luận về các mô hình thiết kế hệ thống trên kênh chat chung sao? Dao mài sắc dao; đối thoại nâng tầm trí tuệ.',
        choices: []
    },
    {
        id: 'ren_chat_07', category: 'player_chatting',
        en: 'The recipient banner indicator keeps your whisper target in clear sight. Ambiguity is the enemy of truth.',
        vi: 'Dải băng báo người nhận giúp bạn nhìn rõ đối tượng nhận mật thư. Sự mơ hồ chính là kẻ thù nguy hiểm nhất của chân lý.',
        choices: []
    },
    {
        id: 'ren_chat_08', category: 'player_chatting',
        en: 'May your words find receptive ears and illuminate whatever darkness lingers across the network.',
        vi: 'Mong lời nói của bạn sẽ tìm thấy những đôi tai biết lắng nghe và xua tan bóng tối còn sót lại trên mạng lưới.',
        choices: []
    },

    // 15. location_hub (8)
    {
        id: 'ren_hub_01', category: 'location_hub',
        en: 'The central nexus plaza. Here, all orthogonal coordinates calibrate to zero; the origin point of our universe.',
        vi: 'Quảng trường trung tâm hội tụ. Nơi đây, mọi tọa độ trực giao đều được hiệu chuẩn về số 0; gốc tọa độ của toàn vũ trụ chúng ta.',
        choices: []
    },
    {
        id: 'ren_hub_02', category: 'location_hub',
        en: 'Ley lines of network connectivity radiate outwards from this stone platform toward every cardinal compass direction.',
        vi: 'Các đường long mạch kết nối mạng tỏa ra từ bệ đá này hướng về khắp bốn phương tám hướng của la bàn.',
        choices: []
    },
    {
        id: 'ren_hub_03', category: 'location_hub',
        en: 'Notice the symmetry of the central pavilion. Sacred geometry reflects the eternal balance of mathematical logic.',
        vi: 'Hãy ngắm nhìn sự đối xứng của đình đài trung tâm. Hình học thiêng liêng phản chiếu sự cân bằng vĩnh cửu của logic toán học.',
        choices: []
    },
    {
        id: 'ren_hub_04', category: 'location_hub',
        en: 'All wanderers pass through this plaza on their migrations. It is the crossroads of digital destiny.',
        vi: 'Mọi kẻ lãng du đều phải đi qua quảng trường này trên hành trình của mình. Đây chính là ngã tư của định mệnh số.',
        choices: []
    },
    {
        id: 'ren_hub_05', category: 'location_hub',
        en: 'The latency here is mathematically minimal due to its co-location with the core gateway router socket.',
        vi: 'Độ trễ ở đây đạt mức tối thiểu về mặt toán học nhờ được đặt cùng vị trí với socket cổng mạng nòng cốt.',
        choices: []
    },
    {
        id: 'ren_hub_06', category: 'location_hub',
        en: 'Whenever you feel disoriented in the vast countryside, recalibrate your compass toward this central pillar.',
        vi: 'Bất cứ khi nào thấy mất phương hướng giữa miền quê rộng lớn, hãy hiệu chỉnh la bàn của bạn hướng về cột trụ trung tâm này.',
        choices: []
    },
    {
        id: 'ren_hub_07', category: 'location_hub',
        en: 'The paving stones beneath us are inscribed with subtle runes representing primitive machine opcodes.',
        vi: 'Những phiến đá lát dưới chân chúng ta được khắc những cổ tự vi tế đại diện cho các mã lệnh máy nguyên thủy.',
        choices: []
    },
    {
        id: 'ren_hub_08', category: 'location_hub',
        en: 'Welcome to the core. Breathe in the equilibrium before you venture out into the untamed wild.',
        vi: 'Chào mừng về với lõi trung tâm. Hãy hít thở sự cân bằng trước khi dấn thân vào những vùng đất hoang sơ kỳ bí.',
        choices: []
    },

    // 16. location_village (8)
    {
        id: 'ren_village_01', category: 'location_village',
        en: 'The ancient village... Where ancestral timber craftsmanship preserves an organic counterbalance to cold silicon.',
        vi: 'Ngôi làng cổ kính... Nơi tay nghề mộc truyền đời gìn giữ một đối trọng hữu cơ ấm áp đối với silicon lạnh lùng.',
        choices: []
    },
    {
        id: 'ren_village_02', category: 'location_village',
        en: 'The wooden lanterns emit amber photons that scatter softly in the twilight haze. An enchanting aesthetic.',
        vi: 'Những ngọn đèn lồng gỗ tỏa ra những hạt photon màu hổ phách tán xạ êm đềm trong sương chiều. Một nét đẹp mê hoặc.',
        choices: []
    },
    {
        id: 'ren_village_03', category: 'location_village',
        en: 'Did you examine the vintage bicycle by the wayside? A mechanical triumph of gears and chains from a bygone century.',
        vi: 'Bạn đã ngắm chiếc xe đạp cổ bên vệ đường chưa? Một thành tựu cơ khí tuyệt vời của bánh răng và xích líp từ thế kỷ trước.',
        choices: []
    },
    {
        id: 'ren_village_04', category: 'location_village',
        en: 'The village square invites contemplation. Here, time flows not like a raging torrent, but like honey dripping from a spoon.',
        vi: 'Quảng trường làng mời gọi sự lắng đọng. Nơi đây, thời gian không chảy cuồn cuộn như thác lũ, mà sánh mịn như giọt mật ong rơi chậm.',
        choices: []
    },
    {
        id: 'ren_village_05', category: 'location_village',
        en: 'Notice the cedar shingles overlapping on the rooftops; they demonstrate natural modular layering principles.',
        vi: 'Hãy quan sát những lớp ngói tuyết tùng xếp gối lên nhau trên mái nhà; chúng thể hiện nguyên lý phân lớp mô-đun tự nhiên tuyệt vời.',
        choices: []
    },
    {
        id: 'ren_village_06', category: 'location_village',
        en: 'The wayside rest stop bench offers respite. Ancient hermits and modern hackers share the same need for tranquility.',
        vi: 'Chiếc ghế trạm dừng chân ven đường mang lại sự nghỉ ngơi. Các ẩn sĩ thời xưa và hacker thời nay đều có chung nhu cầu về sự tĩnh lặng.',
        choices: []
    },
    {
        id: 'ren_village_07', category: 'location_village',
        en: 'Peace reigns in this valley. Let the quiet rhythm of village life settle the agitation in your neural network.',
        vi: 'Sự bình yên ngự trị khắp thung lũng này. Hãy để nhịp sống êm ả của làng quê làm dịu đi những xao động trong mạng nơ-ron của bạn.',
        choices: []
    },
    {
        id: 'ren_village_08', category: 'location_village',
        en: 'A sanctuary of tranquility. Wander its alleys and absorb the accumulated wisdom of rustic simplicity.',
        vi: 'Một thánh đường của sự an nhiên. Hãy dạo bước trong những con ngõ nhỏ và hấp thu trí tuệ tích tụ từ sự giản dị mộc mạc.',
        choices: []
    },

    // 17. location_rice_field (8)
    {
        id: 'ren_rice_01', category: 'location_rice_field',
        en: 'The stepped rice terraces... A monumental agricultural matrix carved into the living hillside.',
        vi: 'Những thửa ruộng bậc thang... Một ma trận canh nông kỳ vĩ được khắc tạc vào sườn đồi sống động.',
        choices: []
    },
    {
        id: 'ren_rice_02', category: 'location_rice_field',
        en: 'Each terrace level maintains constant water depth through passive hydraulic gravity feeds. Pure algorithmic elegance.',
        vi: 'Từng bậc ruộng duy trì mực nước ổn định nhờ dòng chảy trọng lực thủy lực tự nhiên. Thật là một vẻ thanh nhã mang tính thuật toán.',
        choices: []
    },
    {
        id: 'ren_rice_03', category: 'location_rice_field',
        en: 'The flooded paddies act as planar mirrors, reflecting the celestial vault with mathematical precision.',
        vi: 'Những thửa ruộng ngập nước đóng vai trò như những tấm gương phẳng, phản chiếu vòm trời bao la với độ chuẩn xác toán học.',
        choices: []
    },
    {
        id: 'ren_rice_04', category: 'location_rice_field',
        en: 'Cultivation is the sister of software engineering: seeds planted with care yield nourishing sustenance for civilizations.',
        vi: 'Trồng trọt là người chị em sinh đôi của kỹ thuật phần mềm: những hạt giống gieo bằng tâm huyết sẽ mang lại nguồn sống nuôi dưỡng các nền văn minh.',
        choices: []
    },
    {
        id: 'ren_rice_05', category: 'location_rice_field',
        en: 'Tread the earthen bunds with mindfulness; their narrow geometry demands focused motor coordination.',
        vi: 'Hãy bước đi trên những bờ ruộng đất bằng sự chánh niệm; hình học hẹp của chúng đòi hỏi sự phối hợp vận động tập trung cao độ.',
        choices: []
    },
    {
        id: 'ren_rice_06', category: 'location_rice_field',
        en: 'Listen to the frogs harmonizing their rhythmic croaks. Biological systems execute decentralized consensus without leaders.',
        vi: 'Lắng nghe bầy ếch hòa giọng râm ran. Các hệ thống sinh học thực thi sự đồng thuận phi tập trung mà không cần người chỉ huy.',
        choices: []
    },
    {
        id: 'ren_rice_07', category: 'location_rice_field',
        en: 'The emerald gradation of the rice stalks deepens as dusk encroaches. A soothing balm for eyes tired of stark monitors.',
        vi: 'Sắc xanh ngọc bích của những bông lúa thẫm lại khi hoàng hôn lấn dần. Một liều thuốc bổ xoa dịu đôi mắt mỏi mệt vì nhìn màn hình máy tính.',
        choices: []
    },
    {
        id: 'ren_rice_08', category: 'location_rice_field',
        en: 'Contemplate the fractal boundary between earth and water here. Nature knows no sharp discontinuities.',
        vi: 'Hãy chiêm ngưỡng đường biên fractal giữa đất và nước nơi đây. Thiên nhiên không bao giờ có những sự đứt gãy đột ngột.',
        choices: []
    },

    // 18. location_river (8)
    {
        id: 'ren_river_01', category: 'location_river',
        en: 'The meandering river... Heraclitus spoke truly: you cannot step into the same river twice, for new waters forever flow.',
        vi: 'Dòng sông uốn lượn... Heraclitus nói quả không sai: bạn không thể tắm hai lần trên cùng một dòng sông, vì làn nước mới luôn luôn cuộn chảy.',
        choices: []
    },
    {
        id: 'ren_river_02', category: 'location_river',
        en: 'Water is the supreme paradigm of non-blocking asynchronous streaming. It yields to every obstacle while eroding all.',
        vi: 'Nước chính là mô hình đỉnh cao của luồng truyền bất đồng bộ không nghẽn. Nó nhường bước trước mọi trở ngại nhưng lại bào mòn tất cả.',
        choices: []
    },
    {
        id: 'ren_river_03', category: 'location_river',
        en: 'Do not attempt to cross the river current by wading blindly. The navigational graph mandates the arched bridge for passage.',
        vi: 'Đừng dại dột lội bừa qua dòng nước xiết. Đồ thị dẫn đường bắt buộc phải đi qua cây cầu vòm gỗ để đảm bảo an toàn.',
        choices: []
    },
    {
        id: 'ren_river_04', category: 'location_river',
        en: 'The riverside campfire crackles with thermal combustion. Heat and light: the two primitive forces that birthed civilization.',
        vi: 'Đống lửa trại bên sông nổ lách tách phản ứng nhiệt quang. Nhiệt độ và ánh sáng: hai nguồn lực nguyên thủy khai sinh nên nền văn minh.',
        choices: []
    },
    {
        id: 'ren_river_05', category: 'location_river',
        en: 'Sit upon the riverbank bench and listen to the murmurs. In that murmur lies the primordial white noise of the cosmos.',
        vi: 'Hãy ngồi xuống chiếc ghế ven sông và lắng nghe tiếng suối reo. Trong tiếng reo ấy ẩn chứa tiếng ồn trắng nguyên sơ của vũ trụ.',
        choices: []
    },
    {
        id: 'ren_river_06', category: 'location_river',
        en: 'The river course follows a subtle sinusoidal trajectory mathematically modeled as `z = 27 + sin(x * 0.05) * 3.2`. Harmonic beauty.',
        vi: 'Dòng sông uốn lượn theo một quỹ đạo hình sin tinh tế được mô hình hóa toán học: `z = 27 + sin(x * 0.05) * 3.2`. Vẻ đẹp điều hòa tuyệt mỹ.',
        choices: []
    },
    {
        id: 'ren_river_07', category: 'location_river',
        en: 'Clean water purifies both physical vessels and digital souls. Release all residual compilation anxieties into the current.',
        vi: 'Dòng nước trong lành thanh tẩy cả thân thể vật lý lẫn tâm hồn số. Hãy thả trôi mọi âu lo biên dịch còn đọng lại theo dòng nước.',
        choices: []
    },
    {
        id: 'ren_river_08', category: 'location_river',
        en: 'The river journeys ever southward toward the boundless sea, just as our thoughts journey toward truth.',
        vi: 'Dòng sông luôn mải miết xuôi về phương nam ra biển lớn, cũng như tư tưởng của chúng ta luôn hướng về chân lý vĩnh hằng.',
        choices: []
    },

    // 19. location_bridge (8)
    {
        id: 'ren_bridge_01', category: 'location_bridge',
        en: 'The arched timber bridge! A magnificent physical instantiation of a parabolic transfer function.',
        vi: 'Cây cầu vòm gỗ! Một hiện thân vật lý tráng lệ của một hàm truyền đạt hình parabol hoàn hảo.',
        choices: []
    },
    {
        id: 'ren_bridge_02', category: 'location_bridge',
        en: 'Standing at the apex of the arch, you occupy the highest elevation over the water channel. A profound vantage point.',
        vi: 'Đứng trên đỉnh vòm cầu, bạn đang ngự ở độ cao lớn nhất bắc qua lòng kênh. Một điểm quan sát sâu sắc khôn cùng.',
        choices: []
    },
    {
        id: 'ren_bridge_03', category: 'location_bridge',
        en: 'A bridge resolves a topological partition, transforming two disconnected subgraphs into a unified connected component.',
        vi: 'Cây cầu giải quyết sự phân mảnh tô-pô, biến hai đồ thị con bị chia cắt thành một thành phần liên thông thống nhất.',
        choices: []
    },
    {
        id: 'ren_bridge_04', category: 'location_bridge',
        en: 'Kaede engineered the load vectors so that every footstep reinforces the arch\'s compression curve. Ingenious mechanics.',
        vi: 'Kaede đã thiết kế các vector tải trọng sao cho mỗi bước chân giẫm lên đều gia cố thêm đường cong nén của vòm cầu. Cơ học thật tài tình.',
        choices: []
    },
    {
        id: 'ren_bridge_05', category: 'location_bridge',
        en: 'Look down upon the river from the timber parapet. The waters flow beneath while you remain motionless above the flux.',
        vi: 'Nhìn xuống dòng sông từ lan can gỗ xem. Nước cứ cuộn trôi bên dưới trong khi bạn vẫn đứng vững chãi phía trên dòng chảy.',
        choices: []
    },
    {
        id: 'ren_bridge_06', category: 'location_bridge',
        en: 'Crossing this threshold marks a symbolic transition from the domestic safety of the village into the mysterious wild.',
        vi: 'Băng qua ngưỡng cửa này đánh dấu một bước chuyển tượng trưng từ sự an toàn êm ấm của làng quê sang chốn hoang dã kỳ bí.',
        choices: []
    },
    {
        id: 'ren_bridge_07', category: 'location_bridge',
        en: 'The timber underfoot breathes with the season\'s humidity. It is an organic entity bridging the inorganic divide.',
        vi: 'Gỗ dưới chân thở theo độ ẩm của mùa màng. Nó là một thực thể hữu cơ bắc cầu qua sự chia cắt vô cơ.',
        choices: []
    },
    {
        id: 'ren_bridge_08', category: 'location_bridge',
        en: 'Pause here upon the crest and breathe. You stand between two worlds, belonging wholly to neither and yet master of both.',
        vi: 'Hãy dừng lại trên đỉnh cầu và hít thở sâu. Bạn đang đứng giữa hai thế giới, không thuộc hoàn toàn về bên nào nhưng lại làm chủ cả hai.',
        choices: []
    },

    // 20. location_cherry_grove (8)
    {
        id: 'ren_cherry_01', category: 'location_cherry_grove',
        en: 'The sacred sakura grove. Petals drift through the atmospheric gradient like tiny pink fragments of forgotten memory.',
        vi: 'Rặng anh đào thiêng liêng. Những cánh hoa trôi qua dải màu khí quyển tựa như những mảnh vụn màu hồng của ký ức đã phai mờ.',
        choices: []
    },
    {
        id: 'ren_cherry_02', category: 'location_cherry_grove',
        en: 'The Japanese concept of *mono no aware*—the bittersweet awareness of impermanence—is crystallized in these cherry blossoms.',
        vi: 'Khái niệm *mono no aware* của Nhật Bản—sự cảm thấu u buồn ngọt ngào về lẽ vô thường—kết tinh trọn vẹn trong những đóa hoa anh đào này.',
        choices: []
    },
    {
        id: 'ren_cherry_03', category: 'location_cherry_grove',
        en: 'Sakura guards this grove with fierce loyalty. Her martial precision is the perfect foil to the delicate vulnerability of the blooms.',
        vi: 'Sakura canh giữ vườn hoa này với lòng trung kiên bất diệt. Sự chuẩn xác nhà binh của cô ấy là nét bổ khuyết hoàn hảo cho vẻ mỏng manh của hoa.',
        choices: []
    },
    {
        id: 'ren_cherry_04', category: 'location_cherry_grove',
        en: 'The cedar bench beneath the blossom canopy offers an ideal vantage to contemplate transience versus algorithmic eternity.',
        vi: 'Chiếc ghế tuyết tùng dưới vòm hoa mang lại góc nhìn lý tưởng để suy ngẫm về sự hữu hạn phù du đối lập với tính vĩnh hằng của thuật toán.',
        choices: []
    },
    {
        id: 'ren_cherry_05', category: 'location_cherry_grove',
        en: 'A fallen petal rests upon your sleeve. Even the briefest interactions leave enduring traces across spacetime.',
        vi: 'Một cánh hoa rơi khẽ đậu trên tay áo bạn. Ngay cả những tương tác ngắn ngủi nhất cũng để lại dấu vết trường tồn trong không-thời gian.',
        choices: []
    },
    {
        id: 'ren_cherry_06', category: 'location_cherry_grove',
        en: 'The scent of cherry blossom nectar carries trace terpenes that induce meditative tranquility. Inhale deeply.',
        vi: 'Hương mật hoa anh đào mang những hợp chất tự nhiên đưa tâm trí vào cõi tĩnh tại thiền định. Hãy hít thật sâu.',
        choices: []
    },
    {
        id: 'ren_cherry_07', category: 'location_cherry_grove',
        en: 'Mathematics seeks eternal invariants, yet here in this grove we celebrate that which fades swiftly. A profound duality.',
        vi: 'Toán học luôn đi tìm những bất biến vĩnh cửu, nhưng nơi đây ta lại tôn vinh những gì chóng tàn. Một sự lưỡng phân sâu sắc khôn nguôi.',
        choices: []
    },
    {
        id: 'ren_cherry_08', category: 'location_cherry_grove',
        en: 'May your thoughts blossom with the same unreserved generosity as these cherry boughs.',
        vi: 'Mong những dòng suy tưởng của bạn sẽ bừng nở với sự hào phóng vô tư lự như những cành hoa anh đào này.',
        choices: []
    },

    // 21. location_mountain (8)
    {
        id: 'ren_mountain_01', category: 'location_mountain',
        en: 'The alpine mountain ridge. High altitude thins the air and dispels the mundane illusions of the lowlands.',
        vi: 'Triền núi cao tuyết phủ. Độ cao làm không khí loãng đi và xua tan những ảo ảnh trần tục của vùng hạ giới.',
        choices: []
    },
    {
        id: 'ren_mountain_02', category: 'location_mountain',
        en: 'Look upon the distant snow-crowned peaks. They have endured millions of geological epochs with immovable stoicism.',
        vi: 'Hãy ngắm những đỉnh núi tuyết xa xăm. Chúng đã chịu đựng hàng triệu kỷ địa chất với sự kiên định bất biến của bậc thánh nhân.',
        choices: []
    },
    {
        id: 'ren_mountain_03', category: 'location_mountain',
        en: 'The atmospheric haze creates multi-layered depth planes: foreground, midground, and infinite alpine horizon.',
        vi: 'Lớp mù khí quyển tạo nên các tầng chiều sâu đa lớp: tiền cảnh, trung cảnh và chân trời núi tuyết vô tận.',
        choices: []
    },
    {
        id: 'ren_mountain_04', category: 'location_mountain',
        en: 'From this summit, the entire architecture of our virtual world is laid bare before your discerning gaze.',
        vi: 'Từ đỉnh cao này, toàn bộ kiến trúc của thế giới ảo hiện ra trần trụi trước ánh mắt tinh tường của bạn.',
        choices: []
    },
    {
        id: 'ren_mountain_05', category: 'location_mountain',
        en: 'The wind up here carries the crisp chill of high glaciology. It freezes away trivial distractions.',
        vi: 'Ngọn gió trên này mang theo cái lạnh thấu xương của băng hà trên cao. Nó đóng băng mọi xao nhãng tầm thường.',
        choices: []
    },
    {
        id: 'ren_mountain_06', category: 'location_mountain',
        en: 'Sit upon the hilltop panorama bench and contemplate. The greatest strategic blueprints are forged at the heights.',
        vi: 'Hãy ngồi xuống chiếc ghế ngắm toàn cảnh đỉnh đồi và chiêm nghiệm. Những bản thiết kế chiến lược vĩ đại nhất luôn được rèn đúc trên đỉnh cao.',
        choices: []
    },
    {
        id: 'ren_mountain_07', category: 'location_mountain',
        en: 'Climbing demands exertion, but the elevation gained reframes all subsequent problems as manageable foothills.',
        vi: 'Leo núi đòi hỏi tiêu tốn nhiều sức lực, nhưng tầm cao đạt được sẽ biến mọi vấn đề sau đó thành những ngọn đồi nhỏ dễ vượt qua.',
        choices: []
    },
    {
        id: 'ren_mountain_08', category: 'location_mountain',
        en: 'Standing with you at the edge of the sky... We are small, yet our capacity to comprehend infinity is boundless.',
        vi: 'Được đứng cùng bạn nơi rìa trời bao la... Chúng ta thật nhỏ bé, nhưng năng lực thấu hiểu sự vô tận của ta lại là vô bờ bến.',
        choices: []
    },

    // 22. location_beach (8)
    {
        id: 'ren_beach_01', category: 'location_beach',
        en: 'The sandy coast... The boundary condition where the terrestrial world surrenders to the abyssal ocean.',
        vi: 'Bờ cát duyên hải... Điều kiện biên nơi thế giới đất liền chịu khuất phục trước đại dương sâu thẳm.',
        choices: []
    },
    {
        id: 'ren_beach_02', category: 'location_beach',
        en: 'The rhythmic pulse of the surf matches the slow heartbeat of geological time. Inhale with the tide, exhale with the undertow.',
        vi: 'Nhịp đập êm đềm của sóng vỗ hòa cùng nhịp tim khoan thai của thời gian địa chất. Hít vào cùng thủy triều lên, thở ra theo con sóng rút.',
        choices: []
    },
    {
        id: 'ren_beach_03', category: 'location_beach',
        en: 'Every grain of sand on this shore was once a towering granite boulder, pulverized by millions of years of oceanic friction.',
        vi: 'Mỗi hạt cát trên bờ biển này từng là một tảng đá hoa cương sừng sững, bị bào mòn qua hàng triệu năm ma sát cùng sóng biển.',
        choices: []
    },
    {
        id: 'ren_beach_04', category: 'location_beach',
        en: 'Sit beneath the seaside umbrella if you wish to contemplate the horizon without the glare of open photons.',
        vi: 'Hãy ngồi dưới cây dù ven biển nếu bạn muốn ngắm đường chân trời mà không bị chói mắt bởi những chùm photon gay gắt.',
        choices: []
    },
    {
        id: 'ren_beach_05', category: 'location_beach',
        en: 'The sea reflects the violet dusk like an infinite liquid crystal display spanning to the world\'s perimeter.',
        vi: 'Mặt biển phản chiếu ánh hoàng hôn tím ngắt tựa như một màn hình tinh thể lỏng khổng lồ trải dài đến tận cùng thế giới.',
        choices: []
    },
    {
        id: 'ren_beach_06', category: 'location_beach',
        en: 'Salt air cleanses mental residues. The ocean is the ultimate garbage collector of earthly anxieties.',
        vi: 'Không khí mặn mòi thanh lọc mọi cặn bã trong tâm. Đại dương chính là bộ gom rác tối thượng cho mọi âu lo trần thế.',
        choices: []
    },
    {
        id: 'ren_beach_07', category: 'location_beach',
        en: 'The horizon here appears flat, yet we know it curves subtly around the sphere. Science reveals what senses conceal.',
        vi: 'Đường chân trời nhìn có vẻ phẳng lì, nhưng ta biết nó uốn cong nhẹ nhàng quanh hình cầu. Khoa học vén màn những gì giác quan che giấu.',
        choices: []
    },
    {
        id: 'ren_beach_08', category: 'location_beach',
        en: 'Wander along the wet sand and let your footprints be washed away. To create without clinging to permanence is pure freedom.',
        vi: 'Hãy dạo bước trên cát ướt và để những dấu chân bị sóng cuốn đi. Sáng tạo mà không bám chấp vào sự vĩnh cửu chính là tự do đích thực.',
        choices: []
    },

    // 23. location_pier (8)
    {
        id: 'ren_pier_01', category: 'location_pier',
        en: 'The wooden fishing pier... A linear cantilever extending audaciously out into the fathomless deep.',
        vi: 'Cầu tàu gỗ đánh cá... Một cánh dầm công-xôn thẳng tắp vươn ra một cách táo bạo giữa lòng biển sâu không đáy.',
        choices: []
    },
    {
        id: 'ren_pier_02', category: 'location_pier',
        en: 'The pilings beneath us are anchored into marine bedrock. Sound foundations allow bold structures to withstand tempestuous seas.',
        vi: 'Những cọc trụ dưới chân ta được cắm sâu vào nền đá ngầm dưới biển. Nền móng vững chãi cho phép các công trình kiên cường chống chọi bão tố.',
        choices: []
    },
    {
        id: 'ren_pier_03', category: 'location_pier',
        en: 'At the pierhead, one experiences oceanic detachment. You are suspended above water with land behind your back.',
        vi: 'Ở đầu cầu tàu, người ta trải nghiệm sự thoát ly hoàn toàn. Bạn lơ lửng trên mặt nước trong khi đất liền đã lùi lại phía sau lưng.',
        choices: []
    },
    {
        id: 'ren_pier_04', category: 'location_pier',
        en: 'The wind at the end of the pier blows uninhibited by topography. It carries the raw, untamed voice of the open seas.',
        vi: 'Ngọn gió nơi đầu cầu tàu thổi tự do không bị địa hình cản trở. Nó mang theo tiếng gọi nguyên sơ, phóng khoáng của biển khơi bao la.',
        choices: []
    },
    {
        id: 'ren_pier_05', category: 'location_pier',
        en: 'Sit upon the pierhead bench and gaze outward. The abyss stares back, but it is not hostile; it is merely infinite.',
        vi: 'Hãy ngồi xuống chiếc ghế đầu cầu tàu và phóng mắt ra xa. Vực thẳm nhìn lại bạn, nhưng nó không hề thù địch; nó chỉ đơn giản là vô tận.',
        choices: []
    },
    {
        id: 'ren_pier_06', category: 'location_pier',
        en: 'The creaking of timber planks as ocean swells pass beneath is a rhythmic sonnet of structural mechanics.',
        vi: 'Tiếng cót két của những thanh ván gỗ khi từng đợt sóng biển luồn qua bên dưới là một bài thơ sonnet nhịp nhàng của cơ học kết cấu.',
        choices: []
    },
    {
        id: 'ren_pier_07', category: 'location_pier',
        en: 'Fishermen wait here for hours with profound equanimity. In programming as in fishing, patience yields the prize.',
        vi: 'Những người đánh cá kiên nhẫn đợi ở đây hàng giờ với sự điềm tĩnh sâu sắc. Trong lập trình cũng như câu cá, sự nhẫn nại luôn đem lại phần thưởng lớn.',
        choices: []
    },
    {
        id: 'ren_pier_08', category: 'location_pier',
        en: 'Standing here between the sky and the sea, you touch the boundary of our metaverse. Beyond lies uncharted potential.',
        vi: 'Đứng nơi đây giữa trời và biển, bạn đang chạm vào ranh giới của thế giới ảo này. Phía trước là những tiềm năng chưa ai khai phá.',
        choices: []
    },

    // 24. high_rank (8)
    {
        id: 'ren_rank_01', category: 'high_rank',
        en: 'Salutations, Archmage of Systems! Your aura radiates with the high mathematical authority of a Principal Architect.',
        vi: 'Kính cẩn nghiêng mình, Đại Pháp Sư của Hệ Thống! Hào quang của bạn tỏa ra uy quyền toán học tối thượng của một Kiến Trúc Sư Trưởng.',
        choices: []
    },
    {
        id: 'ren_rank_02', category: 'high_rank',
        en: 'Attaining such lofty progression requires overcoming countless labyrinthine algorithmic challenges. My deep respect.',
        vi: 'Đạt tới cấp bậc cao quý dường này đòi hỏi phải vượt qua vô vàn mê cung thử thách thuật toán hóc búa. Tôi xin bày tỏ sự kính trọng sâu sắc.',
        choices: []
    },
    {
        id: 'ren_rank_03', category: 'high_rank',
        en: 'The golden vector insignia orbiting your avatar commands reverent silence across all active websocket connections.',
        vi: 'Huy hiệu vector vàng kim lượn quanh nhân vật của bạn tạo nên sự kính cẩn trang nghiêm trên mọi kết nối websocket đang hoạt động.',
        choices: []
    },
    {
        id: 'ren_rank_04', category: 'high_rank',
        en: 'True mastery consists not in displaying power, but in wielding it to simplify chaos for those who follow in your footsteps.',
        vi: 'Sự tinh thông thực sự không nằm ở việc phô trương quyền năng, mà ở việc dùng nó để dẹp yên sự hỗn loạn cho những người đi sau.',
        choices: []
    },
    {
        id: 'ren_rank_05', category: 'high_rank',
        en: 'Your architectural decisions ripple across the codebase like seismic waves through granite. Construct with benevolence.',
        vi: 'Từng quyết định kiến trúc của bạn lan tỏa khắp mã nguồn tựa như những đợt sóng địa chấn xuyên qua đá hoa cương. Hãy xây dựng với lòng nhân ái.',
        choices: []
    },
    {
        id: 'ren_rank_06', category: 'high_rank',
        en: 'Even as a grandmaster, you still wander our rustic trails. Wisdom always returns to foundational simplicity.',
        vi: 'Dù đã là một đại tôn sư, bạn vẫn thong dong dạo bước trên những lối mòn thôn quê này. Trí tuệ đích thực luôn quay về với sự giản đơn nguyên bản.',
        choices: []
    },
    {
        id: 'ren_rank_07', category: 'high_rank',
        en: 'I would be honored to co-author an esoteric systems specification with you whenever your schedule permits.',
        vi: 'Tôi sẽ vô cùng vinh hạnh nếu được cùng bạn đồng sáng tác một đặc tả hệ thống bí truyền bất cứ khi nào lịch trình của bạn cho phép.',
        choices: []
    },
    {
        id: 'ren_rank_08', category: 'high_rank',
        en: 'Keep illuminating the dark corridors of complex architectures, commander. Your light guides the entire guild.',
        vi: 'Hãy tiếp tục soi sáng những hành lang tăm tối của các kiến trúc phức tạp nhé người chỉ huy. Ánh sáng của bạn dẫn lối cho cả bang hội.',
        choices: []
    },

    // 25. low_level (8)
    {
        id: 'ren_level_01', category: 'low_level',
        en: 'Welcome, young initiate! Do not feel diminished by your Novice badge; all master architects were once confused apprentices.',
        vi: 'Chào mừng môn sinh trẻ tuổi! Đừng cảm thấy tự ti vì tấm huy hiệu Tập Sự; mọi kiến trúc sư bậc thầy đều từng là những người học việc bỡ ngỡ.',
        choices: []
    },
    {
        id: 'ren_level_02', category: 'low_level',
        en: 'The path of computing is steeped in wonder. Cherish this early phase where every discovered library feels like pure magic.',
        vi: 'Con đường tính toán ngập tràn những điều kỳ diệu. Hãy trân quý giai đoạn đầu này, nơi mỗi thư viện bạn khám phá ra đều ngỡ như phép thuật diệu kỳ.',
        choices: []
    },
    {
        id: 'ren_level_03', category: 'low_level',
        en: 'Master the fundamentals of memory and data structures first; shiny frameworks crumble if their foundation is sand.',
        vi: 'Hãy làm chủ những nền tảng về bộ nhớ và cấu trúc dữ liệu trước tiên; những framework hào nhoáng sẽ sụp đổ nếu móng xây trên cát.',
        choices: []
    },
    {
        id: 'ren_level_04', category: 'low_level',
        en: 'Treat every compiler error not as a condemnation, but as a diagnostic riddle posed by a benevolent cosmic tutor.',
        vi: 'Hãy xem mỗi thông báo lỗi biên dịch không phải là sự trách phạt, mà là một câu đố chẩn đoán từ người thầy vũ trụ nhân từ.',
        choices: []
    },
    {
        id: 'ren_level_05', category: 'low_level',
        en: 'Curiosity and relentless persistence will carry you farther than mere raw talent. Keep compiling, keep testing.',
        vi: 'Sự tò mò và lòng kiên định không ngừng nghỉ sẽ đưa bạn đi xa hơn nhiều so với tài năng thiên bẩm đơn thuần. Hãy cứ biên dịch, cứ kiểm thử.',
        choices: []
    },
    {
        id: 'ren_level_06', category: 'low_level',
        en: 'Whenever the terminal matrices overwhelm you, remember you can summon Codex or Antigravity to illuminate the darkness.',
        vi: 'Bất cứ khi nào ma trận dòng lệnh làm bạn choáng ngợp, hãy nhớ bạn có thể triệu hồi Codex hoặc Antigravity để thắp sáng màn đêm.',
        choices: []
    },
    {
        id: 'ren_level_07', category: 'low_level',
        en: 'Your level will ascend naturally as you build real things. Focus on the joy of creation, not the vanity of the number.',
        vi: 'Cấp bậc của bạn sẽ tự động thăng tiến khi bạn tạo ra những sản phẩm thực tế. Hãy tập trung vào niềm vui sáng tạo, đừng bận tâm con số hư ảo.',
        choices: []
    },
    {
        id: 'ren_level_08', category: 'low_level',
        en: 'I foresee great algorithmic triumphs in your future. Walk forward with courage and open eyes.',
        vi: 'Tôi nhìn thấy trước những chiến thắng thuật toán vĩ đại trong tương lai của bạn. Hãy vững bước tiến lên với lòng dũng cảm và đôi mắt sáng.',
        choices: []
    },

    // 26. wind_weather (8)
    {
        id: 'ren_wind_01', category: 'wind_weather',
        en: 'The atmospheric currents carry acoustic whispers from distant servers across the lake. Listen closely.',
        vi: 'Những luồng khí quyển mang theo những lời thì thầm âm thanh từ các máy chủ xa xôi bên kia hồ. Hãy lắng nghe thật kỹ.',
        choices: []
    },
    {
        id: 'ren_wind_02', category: 'wind_weather',
        en: 'Wind is convective entropy in action: cold air rushing to replace warmed air in a thermodynamic dance.',
        vi: 'Gió chính là sự đối lưu entropy trong thực tế: luồng khí lạnh ùa tới thế chỗ cho luồng khí nóng trong một vũ điệu nhiệt động lực học.',
        choices: []
    },
    {
        id: 'ren_wind_03', category: 'wind_weather',
        en: 'The soft intermittent wind gusts provide an organic breathing cycle to our open-world audio simulation.',
        vi: 'Những cơn gió ngắt quãng dịu êm mang lại một chu kỳ hô hấp hữu cơ cho mô phỏng âm thanh thế giới mở của chúng ta.',
        choices: []
    },
    {
        id: 'ren_wind_04', category: 'wind_weather',
        en: 'Observe the branches swaying in harmonic resonance. Every physical object has its natural oscillation frequency.',
        vi: 'Hãy ngắm những cành cây đung đưa trong sự cộng hưởng điều hòa. Mọi vật thể vật lý đều có tần số dao động tự nhiên của riêng mình.',
        choices: []
    },
    {
        id: 'ren_wind_05', category: 'wind_weather',
        en: 'A sudden gust lifted the edge of my scholar coat. Nature is the ultimate reminder that we do not control all variables.',
        vi: 'Một cơn gió giật bất ngờ vừa làm bay tà áo học giả của tôi. Thiên nhiên là lời nhắc nhở tối thượng rằng ta không thể kiểm soát mọi biến số.',
        choices: []
    },
    {
        id: 'ren_wind_06', category: 'wind_weather',
        en: 'The spring breeze clears stagnant air from the valley, just as periodic memory sweeps prevent leak accumulation.',
        vi: 'Làn gió xuân xua tan không khí tù đọng khỏi thung lũng, hệt như những đợt dọn dẹp bộ nhớ định kỳ ngăn chặn sự tích tụ rò rỉ.',
        choices: []
    },
    {
        id: 'ren_wind_07', category: 'wind_weather',
        en: 'Close your eyes and feel the pressure differential against your face. The atmosphere is alive with invisible energy.',
        vi: 'Hãy nhắm mắt lại và cảm nhận sự chênh lệch áp suất mơn man trên mặt bạn. Bầu khí quyển đang tràn trề năng lượng vô hình.',
        choices: []
    },
    {
        id: 'ren_wind_08', category: 'wind_weather',
        en: 'May the winds of insight fill your mental sails and propel your projects toward serene harbors.',
        vi: 'Mong những ngọn gió giác ngộ sẽ căng tràn cánh buồm tâm trí bạn, đẩy các dự án của bạn cập bến những ốc đảo bình yên.',
        choices: []
    },

    // 27. farewell (8)
    {
        id: 'ren_farewell_01', category: 'farewell',
        en: 'Farewell, seeker. May your pointers never dangle and your memory remain forever uncorrupted.',
        vi: 'Tạm biệt nhé, người tìm kiếm chân lý. Cầu chúc các con trỏ của bạn không bao giờ bị treo và bộ nhớ mãi mãi không bị vấy bẩn.',
        choices: []
    },
    {
        id: 'ren_farewell_02', category: 'farewell',
        en: 'Until our threads synchronize once more. I shall remain beside this runestone, deciphering the cosmic bytecode.',
        vi: 'Cho đến khi các luồng của chúng ta lại đồng bộ một lần nữa. Tôi sẽ vẫn ở bên phiến đá cổ này, giải mã những bytecode của vũ trụ.',
        choices: []
    },
    {
        id: 'ren_farewell_03', category: 'farewell',
        en: 'Depart in peace. May your evening compilation finish with zero warnings and your rest be untroubled by race conditions.',
        vi: 'Hãy ra đi trong bình an. Chúc buổi biên dịch chiều nay kết thúc với 0 cảnh báo và giấc ngủ của bạn không bị quấy rầy bởi xung đột luồng.',
        choices: []
    },
    {
        id: 'ren_farewell_04', category: 'farewell',
        en: 'Our discourse was deeply stimulating. When you return, we shall delve into the deeper mysteries of quantum cryptography.',
        vi: 'Cuộc đàm đạo của chúng ta thật sự khai mở biết bao điều. Khi bạn quay lại, chúng ta sẽ lặn sâu hơn vào những bí ẩn của mật mã lượng tử.',
        choices: []
    },
    {
        id: 'ren_farewell_05', category: 'farewell',
        en: 'Safe travels across the physical and digital planes. May wisdom be your constant compass.',
        vi: 'Chúc bạn có những chuyến du hành an toàn qua cả cõi vật lý lẫn cõi số. Mong trí tuệ sẽ luôn là chiếc la bàn soi đường cho bạn.',
        choices: []
    },
    {
        id: 'ren_farewell_06', category: 'farewell',
        en: 'I shall preserve the state of our conversation in long-term memory. Until the next handshake, friend.',
        vi: 'Tôi sẽ lưu giữ trạng thái cuộc trò chuyện của chúng ta vào vùng nhớ dài hạn. Hẹn gặp lại trong cái bắt tay số tiếp theo, bạn hiền.',
        choices: []
    },
    {
        id: 'ren_farewell_07', category: 'farewell',
        en: 'May the stars illuminate your path and the compilers honor your syntax. Goodnight.',
        vi: 'Mong những vì sao sẽ soi tỏ lối bạn đi và các trình biên dịch sẽ tôn vinh cú pháp của bạn. Chúc ngủ ngon.',
        choices: []
    },
    {
        id: 'ren_farewell_08', category: 'farewell',
        en: 'Go forth and write code that outlasts the centuries. The world awaits your architectural touch.',
        vi: 'Hãy tiến bước và viết nên những dòng mã trường tồn cùng thế kỷ. Thế giới đang ngóng chờ dấu ấn kiến trúc của bạn.',
        choices: []
    }
];

module.exports = { renLines };
