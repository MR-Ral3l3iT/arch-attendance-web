import type { Locale } from "@/lib/i18n/config";

export function PrivacyPolicyDocument({ locale }: { locale: Locale }) {
  if (locale === "th") return <Th />;
  return <En />;
}

function Th() {
  return (
    <>
      <p>
        นโยบายฉบับนี้อธิบายว่า ARCHD Attendance (&quot;บริการ&quot;, &quot;ระบบ&quot; หรือ &quot;เรา&quot;) เก็บรวบรวม ใช้ เปิดเผย
        และปกป้องข้อมูลอย่างไร เมื่อท่านใช้แอปพลิเคชันหรือเว็บไซต์ที่เกี่ยวข้องกับบริการ บริการนี้จัดทำขึ้นสำหรับนักศึกษา
        อาจารย์ บุคลากร ผู้ดูแลระบบ และผู้ที่ได้รับอนุญาตจากสถาบันการศึกษา การใช้งานบริการถือว่าท่านได้อ่านและยอมรับนโยบายนี้
        หากสถาบันของท่านมีนโยบายหรือข้อตกลงเพิ่มเติม ให้ถือตามที่สถาบันกำหนดเป็นหลักในส่วนที่เกี่ยวข้อง
      </p>

      <h2>1. ผู้ควบคุมข้อมูลส่วนบุคคล</h2>
      <p>
        ผู้ให้บริการหรือผู้ดูแลระบบตามที่สถาบันศึกษาของท่านกำหนด เป็นผู้รับผิดชอบกำหนดวัตถุประสงค์และวิธีการประมวลผลข้อมูลในระบบ
        สำหรับคำถามเกี่ยวกับข้อมูลของท่าน โปรดติดต่อผู้ดูแลระบบหรือหน่วยงานที่สถาบันท่านมอบหมาย
      </p>

      <h2>2. ข้อมูลที่เราอาจเก็บรวบรวม</h2>
      <p>ขึ้นกับการตั้งค่าของสถาบันและฟีเจอร์ที่เปิดใช้ เราอาจประมวลผลข้อมูลดังต่อไปนี้:</p>
      <ul>
        <li>
          <strong>ข้อมูลบัญชีและยืนยันตัวตน</strong> เช่น รหัสหรืออีเมลของสถาบัน ชื่อ–นามสกุล บทบาท (เช่น นักศึกษา
          อาจารย์ ผู้ดูแลระบบ) และข้อมูลที่ใช้ในการเข้าสู่ระบบ
        </li>
        <li>
          <strong>ข้อมูลการเข้าเรียนและกิจกรรมที่เกี่ยวข้อง</strong> เช่น เวลาเช็คอิน สถานะการเข้าเรียน คาบเรียน
          หรือข้อมูลที่บันทึกตามกระบวนการของสถาบัน
        </li>
        <li>
          <strong>ข้อมูลอุปกรณ์และบันทึกทางเทคนิค</strong> เช่น ประเภทอุปกรณ์ รุ่นระบบปฏิบัติการ ตัวระบุแอปเวอร์ชัน
          หรือข้อมูลจำเป็นเพื่อความปลอดภัยและแก้ไขปัญหา (ตามที่ระบบเก็บจริง)
        </li>
        <li>
          <strong>ข้อมูลตำแหน่งหรือข้อมูลยืนยันการอยู่ในพื้นที่เรียน</strong> เช่น พิกัดโดยประมาณ ข้อมูลเครือข่าย
          หรือข้อมูลอื่นที่ใช้เพื่อป้องกันการเช็คชื่อแทน เฉพาะกรณีที่สถาบันเปิดใช้งานฟีเจอร์ดังกล่าว
        </li>
        <li>
          <strong>ข้อมูลการวิเคราะห์และประสิทธิภาพของระบบ</strong> เช่น เหตุการณ์การใช้งาน ข้อมูลข้อผิดพลาด
          หรือข้อมูลทางเทคนิคที่ใช้เพื่อวิเคราะห์ ปรับปรุง และแก้ไขปัญหาการให้บริการ โดยจะพยายามไม่ระบุตัวบุคคลเมื่อทำได้
        </li>
      </ul>

      <h2>3. วัตถุประสงค์ในการใช้ข้อมูล</h2>
      <p>เราใช้หรือให้สถาบันใช้ข้อมูลเพื่อวัตถุประสงค์ที่ชอบด้วยกฎหมาย รวมถึง:</p>
      <ul>
        <li>ให้บริการบันทึกและรายงานการเข้าเรียนตามภาระผูกพันทางการศึกษาและการบริหารจัดการของสถาบัน</li>
        <li>ยืนยันตัวตน ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต และรักษาความปลอดภัยของระบบ</li>
        <li>ยืนยันการอยู่ในพื้นที่เรียนหรือเงื่อนไขการเช็คชื่อ เพื่อช่วยลดการเช็คชื่อแทนหรือการใช้งานที่ไม่ถูกต้อง</li>
        <li>ปฏิบัติตามคำสั่งทางกฎหมายหรือข้อกำหนดของหน่วยงานที่มีอำนาจ</li>
        <li>ปรับปรุงประสิทธิภาพและความเสถียรของบริการ (ในกรณีที่ไม่ระบุตัวบุคคลเมื่อทำได้)</li>
      </ul>

      <h2>4. ฐานทางกฎหมาย</h2>
      <p>
        การประมวลผลอาจอาศัยฐาน เช่น ความจำเป็นในการปฏิบัติตามสัญญาหรือภาระผูกพันก่อนเข้าทำสัญญา การปฏิบัติตามภาระผูกพันทางกฎหมาย
        หรือความจำเป็นโดยชอบด้วยกฎหมายของสถาบัน โดยขึ้นกับบริบทของสถาบันและกฎหมายคุ้มครองข้อมูลที่ใช้บังคับ
      </p>

      <h2>5. การเปิดเผยและการโอนข้อมูล</h2>
      <p>
        โดยหลักข้อมูลจะถูกใช้ภายในสถาบันและผู้ที่ได้รับมอบหมายให้ดูแลระบบ เราอาจเปิดเผยข้อมูลแก่ผู้ให้บริการโครงสร้างพื้นฐาน
        (เช่น ผู้ให้บริการเซิร์ฟเวอร์หรือคลาวด์) เพื่อให้บริการได้ตามปกติ โดยกำหนดให้มีมาตรการปกป้องข้อมูลที่เหมาะสม
        หากมีการโอนข้อมูลไปต่างประเทศ จะดำเนินการให้สอดคล้องกับกฎหมายที่เกี่ยวข้อง
      </p>

      <h2>6. ระยะเวลาเก็บรักษา</h2>
      <p>
        เราเก็บรักษาข้อมูลตามระยะเวลาที่จำเป็นสำหรับวัตถุประสงค์ข้างต้น หรือตามที่กฎหมายและนโยบายของสถาบันกำหนด
        เมื่อพ้นระยะเวลาดังกล่าว ข้อมูลจะถูกลบ ทำลาย หรือทำให้ไม่สามารถระบุตัวบุคคลได้ ตามแนวทางที่เหมาะสม
      </p>

      <h2>7. สิทธิของเจ้าของข้อมูล</h2>
      <p>
        ภายใต้กฎหมายที่ใช้บังคับ ท่านอาจมีสิทธิ เช่น การเข้าถึง การแก้ไข การลบหรือระงับการใช้ การคัดค้าน การถอนความยินยอม
        (หากอาศัยความยินยอม) หรือการร้องเรียนต่อหน่วยงานที่มีอำนาจ ท่านสามารถยื่นคำขอผ่านช่องทางที่สถาบันกำหนด
        รายละเอียดการขอลบข้อมูลดูได้ที่หน้า &quot;การลบข้อมูลของผู้ใช้งาน&quot; หรือเส้นทาง /th/data-deletion
      </p>

      <h2>8. บริการวิเคราะห์ ข้อมูลทางเทคนิค และผู้ให้บริการภายนอก</h2>
      <p>
        ระบบอาจใช้บริการวิเคราะห์ ประมวลผลข้อผิดพลาด หรือโครงสร้างพื้นฐานจากผู้ให้บริการภายนอก เช่น ผู้ให้บริการเซิร์ฟเวอร์
        คลาวด์ ระบบบันทึกข้อผิดพลาด หรือบริการวิเคราะห์การใช้งาน เพื่อช่วยให้ระบบทำงานได้อย่างปลอดภัย เสถียร และเหมาะสม
        ข้อมูลดังกล่าวจะถูกใช้เท่าที่จำเป็นต่อการให้บริการ การรักษาความปลอดภัย และการปรับปรุงระบบ
      </p>

      <h2>9. ความปลอดภัยของข้อมูล</h2>
      <p>
        เราใช้มาตรการที่เหมาะสมทางเทคนิคและองค์กรเพื่อปกป้องข้อมูลจากการเข้าถึงโดยไม่ได้รับอนุญาต การสูญหาย หรือการใช้โดยมิชอบ
        อย่างไรก็ตาม การส่งข้อมูลผ่านอินเทอร์เน็ตไม่มีความปลอดภัยแบบสมบูรณ์ ท่านควรช่วยรักษาความลับของข้อมูลการเข้าสู่ระบบ
      </p>

      <h2>10. การเปลี่ยนแปลงนโยบาย</h2>
      <p>
        เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว การเปลี่ยนแปลงที่สำคัญจะแจ้งให้ทราบตามช่องทางที่เหมาะสม (เช่น หน้าเว็บไซต์หรือประกาศจากสถาบัน)
        การใช้งานต่อไปหลังมีการเปลี่ยนแปลงอาจถือเป็นการยอมรับนโยบายฉบับใหม่ โปรดตรวจสอบวันที่อัปเดตด้านบนเป็นระยะ
      </p>

      <h2>11. การติดต่อ</h2>
      <p>
        หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือประสงค์ใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล โปรดติดต่อผู้ดูแลระบบ
        หรือหน่วยงานที่สถาบันของท่านแต่งตั้งเป็นผู้ประสานงานด้านข้อมูลส่วนบุคคล หากสถาบันไม่ได้กำหนดช่องทางไว้
        สามารถติดต่อผู้ดูแลระบบ ARCHD Attendance ผ่านช่องทางที่ระบุไว้ในหน้าเว็บไซต์หรือแอปพลิเคชันของบริการ
      </p>
    </>
  );
}

function En() {
  return (
    <>
      <p>
        This policy explains how ARCHD Attendance (the &quot;Service&quot;, the &quot;System&quot;, or &quot;we&quot;) collects, uses,
        discloses, and protects information when you use our applications or related websites. The Service is intended
        for students, teachers, staff, administrators, and other authorized users of an educational institution. By using
        the Service, you acknowledge that you have read this policy. If your institution provides additional policies or
        agreements, those apply where relevant.
      </p>

      <h2>1. Data controller</h2>
      <p>
        The service provider or system administrator designated by your educational institution determines the purposes and
        means of processing data in the system. For questions about your data, contact your institution&apos;s
        administrator or the unit your institution has assigned.
      </p>

      <h2>2. Information we may collect</h2>
      <p>Depending on your institution&apos;s configuration and enabled features, we may process:</p>
      <ul>
        <li>
          <strong>Account and identity data</strong>, such as institutional ID or email, name, role (e.g., student,
          teacher, administrator), and credentials used to sign in.
        </li>
        <li>
          <strong>Attendance and related activity data</strong>, such as check-in times, attendance status, class
          sessions, or records created under your institution&apos;s processes.
        </li>
        <li>
          <strong>Device and technical logs</strong>, such as device type, operating system, app version identifiers, or
          information required for security and troubleshooting (as actually collected by the system).
        </li>
        <li>
          <strong>Location or classroom presence verification data</strong>, such as approximate location, network data,
          or other information used to help prevent proxy attendance, only where your institution enables those features.
        </li>
        <li>
          <strong>Analytics and performance data</strong>, such as usage events, error information, or technical data used
          to analyze, improve, and troubleshoot the Service, using non-identifying data where feasible.
        </li>
      </ul>

      <h2>3. Purposes of use</h2>
      <p>We or your institution may use data for lawful purposes, including:</p>
      <ul>
        <li>Providing attendance recording and reporting aligned with educational obligations and institutional management.</li>
        <li>Authenticating users, preventing unauthorized access, and maintaining system security.</li>
        <li>Verifying classroom presence or attendance conditions to help reduce proxy attendance or improper use.</li>
        <li>Complying with legal requirements or orders from competent authorities.</li>
        <li>Improving performance and stability (including anonymized analytics where feasible).</li>
      </ul>

      <h2>4. Legal bases</h2>
      <p>
        Processing may rely on bases such as performance of a contract or pre-contractual steps, compliance with legal
        obligations, or legitimate interests of the institution, depending on context and applicable data protection law.
      </p>

      <h2>5. Disclosure and transfers</h2>
      <p>
        Data is primarily used within your institution and by authorized operators. We may share data with infrastructure
        providers (e.g., hosting or cloud services) under appropriate safeguards. Cross-border transfers, if any, are
        handled in line with applicable laws.
      </p>

      <h2>6. Retention</h2>
      <p>
        We retain data only as long as necessary for the purposes above or as required by law and institutional policy.
        After that period, data is deleted, destroyed, or anonymized as appropriate.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Subject to applicable law, you may have rights such as access, rectification, erasure or restriction,
        objection, withdrawal of consent (where consent is the basis), or lodging a complaint with a supervisory
        authority. Submit requests through channels your institution defines. See the &quot;Account &amp; data
        deletion&quot; page or /en/data-deletion for erasure-related details.
      </p>

      <h2>8. Analytics, technical services, and external providers</h2>
      <p>
        The Service may use external providers for analytics, error processing, or infrastructure, such as hosting,
        cloud services, error logging, or usage analytics. These services help keep the System secure, stable, and
        appropriate for institutional use. Such information is used only as necessary to provide the Service, maintain
        security, and improve the System.
      </p>

      <h2>9. Security</h2>
      <p>
        We apply appropriate technical and organizational measures to protect data against unauthorized access, loss, or
        misuse. However, no internet transmission is completely secure; please protect your sign-in credentials.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be communicated through appropriate channels
        (e.g., the website or institutional notices). Continued use after changes may constitute acceptance. Please review
        the &quot;Last updated&quot; date at the top periodically.
      </p>

      <h2>11. Contact</h2>
      <p>
        For privacy questions or requests related to your personal data, contact your institution&apos;s administrator or the
        privacy contact your institution has designated. If your institution has not provided a channel, you may contact
        the ARCHD Attendance administrator through the contact channel shown on the Service website or application.
      </p>
    </>
  );
}
