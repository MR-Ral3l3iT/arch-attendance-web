import type { Locale } from "@/lib/i18n/config";

export function TermsOfUseDocument({ locale }: { locale: Locale }) {
  if (locale === "th") return <Th />;
  return <En />;
}

function Th() {
  return (
    <>
      <p>
        เอกสารนี้กำหนดข้อกำหนดและเงื่อนไขการเข้าถึงและใช้งานบริการ ARCHD Attendance ซึ่งรวมถึงแอปพลิเคชัน เว็บไซต์
        และฟังก์ชันที่เกี่ยวเนื่อง (&quot;บริการ&quot;, &quot;ระบบ&quot; หรือ &quot;เรา&quot;) บริการนี้จัดทำขึ้นเพื่อสนับสนุนการจัดการการเข้าเรียน
        การบริหารจัดการด้านการศึกษา และกิจกรรมที่เกี่ยวข้องภายในสถาบันการศึกษา การใช้บริการแสดงว่าท่านได้อ่าน เข้าใจ
        และยอมรับเงื่อนไขเหล่านี้ หากท่านไม่ยอมรับ โปรดงดการใช้งานบริการ
      </p>

      <h2>1. คุณสมบัติของผู้ใช้และบัญชี</h2>
      <p>
        บริการอาจเปิดให้เฉพาะบุคลากรหรือนักศึกษาที่สถาบันอนุญาต ท่านต้องใช้ข้อมูลประจำตัวที่เป็นความจริง และรักษาความลับของรหัสผ่านหรือวิธีการยืนยันตัวตน
        ท่านรับผิดชอบต่อกิจกรรมที่เกิดขึ้นภายใต้บัญชีของท่าน หากพบการเข้าถึงโดยไม่ได้รับอนุญาต โปรดแจ้งผู้ดูแลระบบโดยเร็ว
      </p>

      <h2>2. การใช้งานตามวัตถุประสงค์</h2>
      <p>
        ท่านตกลงใช้บริการเพื่อวัตถุประสงค์ทางการศึกษาและการบริหารจัดการการเข้าเรียนตามที่สถาบันกำหนด ไม่ใช้บริการเพื่อกิจกรรมที่ผิดกฎหมาย
        ละเมิดสิทธิผู้อื่น หรือขัดต่อความสงบเรียบร้อยและศีลธรรมอันดีของประชาชน
      </p>

      <h2>3. พฤติกรรมที่ห้าม</h2>
      <p>ท่านตกลงว่าจะไม่กระทำการ รวมถึงแต่ไม่จำกัดเพียง:</p>
      <ul>
        <li>พยายามเข้าถึงระบบ บัญชีผู้อื่น หรือข้อมูลโดยไม่ได้รับอนุญาต</li>
        <li>แทรกแซงหรือทำลายความปลอดภัย ความเสถียร หรือการทำงานของบริการ</li>
        <li>ใช้ระบบอัตโนมัติเพื่อดึงข้อมูลหรือโหลดภาระโดยไม่ได้รับอนุญาตจากผู้ดูแลระบบ</li>
        <li>ส่งหรือเผยแพร่มัลแวร์ เนื้อหาที่ผิดกฎหมาย หรือเนื้อหาที่ละเมิดสิทธิบุคคลอื่น</li>
        <li>ปลอมแปลงข้อมูลการเข้าเรียนหรือข้อมูลสำคัญของสถาบัน</li>
        <li>พยายามปลอมแปลงตำแหน่งที่ตั้ง อุปกรณ์ หรือข้อมูลทางเทคนิคเพื่อหลีกเลี่ยงเงื่อนไขการเช็คชื่อของสถาบัน</li>
        <li>นำบริการไปใช้ในลักษณะที่อาจก่อให้เกิดความเสียหาย ความเข้าใจผิด หรือผลกระทบต่อสถาบัน ผู้ใช้งานอื่น หรือระบบ</li>
      </ul>

      <h2>4. ทรัพย์สินทางปัญญา</h2>
      <p>
        เนื้อหา โลโก้ ซอฟต์แวร์ และองค์ประกอบของบริการเป็นทรัพย์สินของผู้ให้สิทธิ์หรือผู้ถือลิขสิทธิ์ ห้ามคัดลอก ดัดแปลง หรือแจกจ่ายโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
        เว้นแต่เป็นไปตามข้อกำหนดของกฎหมายหรือสิทธิการใช้งานที่ชัดเจน
      </p>

      <h2>5. การเปลี่ยนแปลงหรือระงับบริการ</h2>
      <p>
        เราหรือสถาบันอาจปรับปรุง เปลี่ยนแปลง ระงับ หรือยกเลิกฟีเจอร์หรือบริการบางส่วนเพื่อเหตุผลด้านเทคนิค
        ความปลอดภัย การบำรุงรักษา การปฏิบัติตามกฎหมาย หรือการบริหารจัดการ โดยจะพยายามแจ้งให้ทราบล่วงหน้าเมื่อสามารถดำเนินการได้
        เราไม่รับประกันว่าบริการจะทำงานได้อย่างต่อเนื่อง ปราศจากข้อผิดพลาด หรือสามารถใช้งานได้ทุกเวลา
      </p>

      <h2>6. การระงับหรือยกเลิกการใช้งาน</h2>
      <p>
        หากท่านละเมิดเงื่อนไขนี้หรือข้อกำหนดของสถาบัน เราหรือผู้ดูแลระบบอาจระงับหรือยกเลิกสิทธิการใช้งานทันทีหรือตามขั้นตอนที่กำหนด การระงับหรือยกเลิกไม่กระทบสิทธิหรือหน้าที่ที่เกิดขึ้นก่อนวันที่มีผล
      </p>

      <h2>7. ข้อจำกัดความรับผิด</h2>
      <p>
        ภายในขอบเขตสูงสุดที่กฎหมายอนุญาต บริการจัดให้ &quot;ตามสภาพที่เป็นอยู่&quot; และ &quot;ตามที่มีให้ใช้งาน&quot;
        โดยเราไม่รับประกันไม่ว่าโดยชัดแจ้งหรือโดยปริยาย รวมถึงความเหมาะสมกับวัตถุประสงค์เฉพาะ ความต่อเนื่องของระบบ
        หรือความไม่ละเมิดสิทธิของบุคคลที่สาม เราไม่รับผิดชอบต่อความเสียหายทางอ้อม ความเสียหายพิเศษ
        การสูญเสียข้อมูล การสูญเสียทางธุรกิจ หรือความเสียหายที่เกิดจากการใช้งานหรือไม่สามารถใช้งานบริการได้
        เว้นแต่ในกรณีที่กฎหมายไม่อนุญาตให้จำกัดความรับผิดดังกล่าว
      </p>

      <h2>8. การเชื่อมโยงไปยังบริการภายนอก</h2>
      <p>
        บริการอาจมีลิงก์หรือการเชื่อมต่อกับระบบภายนอก (เช่น การยืนยันตัวตนหรือการแจ้งเตือน) การใช้บริการภายนอกอยู่ภายใต้ข้อกำหนดของผู้ให้บริการนั้น
        เราไม่รับผิดชอบต่อเนื้อหาหรือแนวปฏิบัติความเป็นส่วนตัวของบุคคลที่สาม
      </p>

      <h2>9. กฎหมายที่ใช้บังคับ</h2>
      <p>
        เงื่อนไขนี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทที่เกี่ยวข้องอาจถูกพิจารณาในศาลที่มีเขตอำนาจตามที่กฎหมายกำหนด หากมีข้อความใดขัดหรือแย้งกับนโยบายของสถาบันหรือคำสั่งของหน่วยงานที่มีอำนาจ
        ให้ถือตามที่กฎหมายและคำสั่งนั้น
      </p>

      <h2>10. การแก้ไขเงื่อนไข</h2>
      <p>
        เราอาจแก้ไขเงื่อนไขนี้เป็นครั้งคราว การแก้ไขที่สำคัญจะประกาศตามช่องทางที่เหมาะสม การใช้บริการต่อไปหลังวันที่มีผลอาจถือเป็นการยอมรับเงื่อนไขฉบับแก้ไข โปรดตรวจสอบวันที่อัปเดตด้านบนของหน้านี้
      </p>

      <h2>11. การติดต่อ</h2>
      <p>
        หากมีคำถามเกี่ยวกับเงื่อนไขการใช้งาน หรือพบปัญหาเกี่ยวกับการเข้าถึงบริการ โปรดติดต่อผู้ดูแลระบบ
        หรือหน่วยงานที่สถาบันของท่านกำหนดเป็นผู้ประสานงาน หากไม่มีการกำหนดช่องทางเฉพาะ
        สามารถติดต่อผ่านช่องทางที่ระบุไว้ในเว็บไซต์หรือแอปพลิเคชันของ ARCHD Attendance
      </p>
    </>
  );
}

function En() {
  return (
    <>
      <p>
        These terms govern access to and use of ARCHD Attendance, including applications, websites, and related
        functions (the &quot;Service&quot;, the &quot;System&quot;, or &quot;we&quot;). The Service is intended to support
        attendance management, educational administration, and related institutional activities. By using the Service,
        you confirm that you have read, understood, and agree to these terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. Eligibility and accounts</h2>
      <p>
        The Service may be limited to students and staff authorized by your institution. You must provide accurate
        identity information and keep passwords or authentication factors confidential. You are responsible for activity
        under your account. Report suspected unauthorized access to your administrator promptly.
      </p>

      <h2>2. Permitted use</h2>
      <p>
        You agree to use the Service for educational purposes and attendance administration as defined by your
        institution. You must not use it for unlawful activity, infringement of others&apos; rights, or conduct contrary
        to public order and good morals.
      </p>

      <h2>3. Prohibited conduct</h2>
      <p>You agree not to, including but not limited to:</p>
      <ul>
        <li>Attempt to access systems, other users&apos; accounts, or data without authorization.</li>
        <li>Interfere with or undermine the security, stability, or operation of the Service.</li>
        <li>Use automation to scrape or impose unreasonable load without administrator approval.</li>
        <li>Distribute malware, unlawful content, or content that infringes others&apos; rights.</li>
        <li>Falsify attendance records or other institutional records.</li>
        <li>Attempt to falsify location, device, or technical information to bypass institutional attendance conditions.</li>
        <li>Use the Service in a way that may cause harm, confusion, or disruption to institutions, users, or the System.</li>
      </ul>

      <h2>4. Intellectual property</h2>
      <p>
        Content, logos, software, and Service components are owned by licensors or rights holders. Do not copy, modify, or
        redistribute them without written permission except as permitted by law or explicit license.
      </p>

      <h2>5. Changes or suspension</h2>
      <p>
        We or your institution may modify, suspend, or discontinue features or parts of the Service for technical,
        security, maintenance, legal, or operational reasons. We will attempt to provide advance notice where feasible.
        We do not guarantee uninterrupted, error-free, or always-available operation of the Service.
      </p>

      <h2>6. Suspension or termination</h2>
      <p>
        If you breach these terms or institutional rules, we or administrators may suspend or terminate access immediately
        or according to defined procedures. Suspension or termination does not affect rights or obligations arising before
        the effective date.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the Service is provided &quot;as is&quot; and &quot;as available&quot;
        without express or implied warranties, including fitness for a particular purpose, continuous availability,
        or non-infringement. We are not liable for indirect damages, special damages, loss of data, business losses,
        or damages arising from use of or inability to use the Service, except where liability cannot legally be limited.
      </p>

      <h2>8. Third-party services</h2>
      <p>
        The Service may link to or integrate third-party systems (e.g., authentication or notifications). Those services
        are governed by their providers. We are not responsible for third-party content or privacy practices.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of Thailand. Disputes may be brought in courts of competent jurisdiction. If
        any provision conflicts with institutional policy or binding authority of a regulator, the law or order prevails.
      </p>

      <h2>10. Changes to the terms</h2>
      <p>
        We may revise these terms periodically. Material changes will be communicated through appropriate channels.
        Continued use after the effective date may constitute acceptance. Please review the &quot;Last updated&quot; date at
        the top of this page.
      </p>

      <h2>11. Contact</h2>
      <p>
        For questions about these terms or issues related to access to the Service, contact your institution&apos;s
        administrator or designated contact. If no specific channel has been provided, you may contact ARCHD Attendance
        through the contact information shown on the Service website or application.
      </p>
    </>
  );
}
