import type { Locale } from "@/lib/i18n/config";

export function DataDeletionDocument({ locale }: { locale: Locale }) {
  if (locale === "th") return <Th />;
  return <En />;
}

function Th() {
  return (
    <>
      <p>
        เอกสารนี้อธิบายแนวทางให้ผู้ใช้บริการ ARCHD Attendance (&quot;บริการ&quot;, &quot;ระบบ&quot; หรือ &quot;เรา&quot;) ขอลบบัญชี
        ขอลบข้อมูลส่วนบุคคล หรือขอให้จำกัดการประมวลผล ตามขอบเขตที่กฎหมายและนโยบายของสถาบันอนุญาต
        บริการนี้ใช้สำหรับนักศึกษา อาจารย์ บุคลากร ผู้ดูแลระบบ และผู้ที่ได้รับอนุญาตจากสถาบันการศึกษา
        การดำเนินการอาจแตกต่างกันตามบทบาทของผู้ใช้ ประเภทข้อมูล และข้อกำหนดของสถาบันของท่าน
      </p>

      <h2>1. สิทธิในการขอลบหรือคัดค้าน</h2>
      <p>
        ภายใต้กฎหมายคุ้มครองข้อมูลส่วนบุคคลที่ใช้บังคับ ท่านอาจมีสิทธิขอให้ลบ ทำลาย ทำให้ข้อมูลเป็นข้อมูลที่ไม่ระบุตัวบุคคล
        ระงับการใช้ หรือคัดค้านการประมวลผลข้อมูล เมื่อไม่มีเหตุให้เก็บรักษาตามกฎหมาย หรือเมื่อท่านถอนความยินยอม
        (กรณีที่การประมวลผลอาศัยความยินยอม) อย่างไรก็ตาม ข้อมูลบางประเภทอาจต้องถูกเก็บรักษาต่อเพื่อการปฏิบัติตามกฎหมาย
        ระเบียบของสถาบัน ภาระทางการศึกษา การตรวจสอบย้อนหลัง หรือการรักษาความปลอดภัยของระบบ
      </p>

      <h2>2. ข้อมูลใดที่อาจลบได้บ้าง</h2>
      <p>โดยทั่วไปอาจพิจารณาตามประเภทข้อมูล ดังนี้:</p>
      <ul>
        <li>
          <strong>ข้อมูลบัญชีและโปรไฟล์</strong> — เมื่อสิ้นสุดสถานะความสัมพันธ์กับสถาบันตามที่กำหนด และไม่มีเหตุให้เก็บรักษาตามกฎหมาย อาจดำเนินการลบหรือปิดการใช้งานบัญชีตามขั้นตอนของสถาบัน
        </li>
        <li>
          <strong>ข้อมูลการเข้าเรียนหรือบันทึกทางวิชาการ</strong> — อาจต้องเก็บรักษาไว้ตามระยะเวลาที่กฎหมาย ระเบียบของสถาบัน
          หรือความจำเป็นด้านหลักฐานทางการศึกษา การลบอาจทำได้เพียงบางส่วน ทำให้ไม่ระบุตัวบุคคล หรือดำเนินการหลังพ้นกำหนดเก็บรักษา
        </li>
        <li>
          <strong>บันทึกทางเทคนิค</strong> — อาจถูกลบหรือทำให้ไม่ระบุตัวบุคคลเมื่อไม่จำเป็นต่อความปลอดภัยของระบบหรือการสอบสวน
        </li>
        <li>
          <strong>ข้อมูลตำแหน่งหรือข้อมูลยืนยันการอยู่ในพื้นที่เรียน</strong> — หากมีการใช้งานฟีเจอร์ยืนยันพื้นที่เรียน ข้อมูลดังกล่าวอาจถูกลบ
          ทำให้ไม่ระบุตัวบุคคล หรือเก็บไว้ตามความจำเป็นเพื่อการตรวจสอบความถูกต้องของการเช็คชื่อและการป้องกันการทุจริต
        </li>
        <li>
          <strong>ข้อมูลวิเคราะห์การใช้งานและประสิทธิภาพ</strong> — อาจถูกลบหรือทำให้ไม่ระบุตัวบุคคลเมื่อไม่จำเป็นต่อการปรับปรุงระบบ
          การแก้ไขข้อผิดพลาด หรือการรักษาความปลอดภัยของบริการ
        </li>
      </ul>

      <h2>3. วิธีการขอลบข้อมูลหรือปิดบัญชี</h2>
      <p>ท่านสามารถดำเนินการตามช่องทางที่สถาบันเปิดใช้ หรือช่องทางที่แสดงไว้ในเว็บไซต์/แอปพลิเคชันของบริการ ซึ่งอาจรวมถึง:</p>
      <ul>
        <li>
          <strong>ติดต่อผู้ดูแลระบบหรือหน่วยไอทีของสถาบัน</strong> — แจ้งความประสงค์ พร้อมยืนยันตัวตน (เช่น รหัสนักศึกษา/บุคลากร อีเมลสถาบัน) เพื่อให้ตรวจสอบสิทธิก่อนดำเนินการ
        </li>
        <li>
          <strong>ช่องทางในแอปหรือเว็บ (หากเปิดใช้)</strong> — หากมีเมนูหรือฟอร์มขอลบบัญชีโดยเฉพาะ ให้ปฏิบัติตามขั้นตอนบนหน้าจอและเอกสารแนบ (ถ้ามี)
        </li>
        <li>
          <strong>การแจ้งเป็นลายลักษณ์อักษร</strong> — บางสถาบันอาจกำหนดให้ส่งคำขอทางอีเมลหรือแบบฟอร์มที่กำหนด
        </li>
        <li>
          <strong>หน้าเว็บไซต์สำหรับการลบข้อมูล</strong> — ท่านสามารถศึกษาขั้นตอนเบื้องต้นได้ที่เส้นทาง /th/data-deletion
          และดำเนินการตามช่องทางที่สถาบันหรือผู้ดูแลระบบกำหนด
        </li>
      </ul>
      <p>
        เพื่อความปลอดภัย เราอาจขอข้อมูลเพิ่มเติมเพื่อยืนยันว่าผู้ขอเป็นเจ้าของบัญชีจริงหรือเป็นผู้มีอำนาจตามที่สถาบันกำหนด
        ก่อนดำเนินการลบ ปิดการใช้งาน หรือจำกัดการประมวลผลข้อมูล
      </p>

      <h2>4. ระยะเวลาดำเนินการ</h2>
      <p>
        ภายหลังได้รับคำขอที่สมบูรณ์และยืนยันตัวตนแล้ว ผู้ดูแลระบบจะพิจารณาและดำเนินการภายในระยะเวลาที่สมเหตุสมผล
        โดยปกติไม่เกิน 30 วันนับจากวันที่ได้รับคำขอที่ครบถ้วน ทั้งนี้อาจขึ้นกับความซับซ้อนของคำขอ ภาระของระบบ
        ประเภทข้อมูล หรือข้อกำหนดภายในของสถาบัน หากไม่สามารถดำเนินการตามคำขอได้ทั้งหมด จะแจ้งเหตุผลและขอบเขตที่สามารถดำเนินการได้ให้ทราบ
      </p>

      <h2>5. ผลของการลบบัญชี</h2>
      <p>
        เมื่อลบบัญชีหรือปิดการใช้งานแล้ว ท่านอาจไม่สามารถเข้าสู่ระบบ ใช้ฟีเจอร์ที่ต้องมีบัญชี หรือเข้าถึงประวัติการใช้งานบางส่วนได้
        ข้อมูลบางส่วนที่ต้องเก็บรักษาตามกฎหมาย ระเบียบของสถาบัน หรือเพื่อความปลอดภัยของระบบ อาจยังคงอยู่ในรูปแบบที่จำกัด
        หรือในรูปแบบที่ไม่ระบุตัวบุคคล การสำรองข้อมูลและระบบบันทึกย้อนหลังอาจใช้เวลาเพิ่มเติมก่อนที่ผลการลบจะสะท้อนครบทุกระบบ
      </p>

      <h2>6. ข้อยกเว้นตามกฎหมายหรือภาระของสถาบัน</h2>
      <p>
        เราหรือสถาบันอาจปฏิเสธ ชะลอ หรือจำกัดการลบบางส่วนหากมีเหตุจำเป็น เช่น มีการร้องเรียน การตรวจสอบ หรือการสอบสวนที่ยังไม่แล้วเสร็จ
        มีภาระผูกพันตามกฎหมายหรือระเบียบของสถาบันที่ต้องเก็บรักษาข้อมูล ข้อมูลจำเป็นต่อการพิสูจน์สิทธิหรือป้องกันข้อเรียกร้อง
        หรือการลบข้อมูลอาจกระทบสิทธิและความปลอดภัยของผู้ใช้งานหรือบุคคลอื่น
      </p>

      <h2>7. การติดต่อ</h2>
      <p>
        หากท่านต้องการขอลบข้อมูล ปิดบัญชี จำกัดการประมวลผล หรือสอบถามสถานะคำขอ โปรดติดต่อผู้ดูแลระบบ
        หรือหน่วยงานที่สถาบันของท่านกำหนดเป็นผู้ประสานงานด้านข้อมูลส่วนบุคคล หากสถาบันไม่ได้กำหนดช่องทางเฉพาะ
        สามารถติดต่อผ่านช่องทางที่ระบุไว้ในเว็บไซต์หรือแอปพลิเคชันของ ARCHD Attendance และศึกษารายละเอียดเพิ่มเติมได้ที่หน้า
        &quot;นโยบายความเป็นส่วนตัว&quot; บนเว็บไซต์เดียวกัน
      </p>
    </>
  );
}

function En() {
  return (
    <>
      <p>
        This page explains how users of ARCHD Attendance (the &quot;Service&quot;, the &quot;System&quot;, or &quot;we&quot;) can request
        deletion of an account or personal data, or request restriction of processing, within the limits allowed by law
        and your institution&apos;s policies. The Service is intended for students, teachers, staff, administrators, and
        other authorized users of educational institutions. Procedures may vary by user role, data category, and
        institutional rules.
      </p>

      <h2>1. Right to erasure or objection</h2>
      <p>
        Under applicable personal data protection laws, you may have the right to request deletion, destruction,
        anonymization, restriction of use, or objection to processing when there is no lawful basis to retain data or when
        you withdraw consent (where consent is the basis). Certain records may still need to be retained for legal
        obligations, institutional regulations, educational requirements, audit purposes, or system security.
      </p>

      <h2>2. What may be deleted</h2>
      <p>In general, requests are assessed by category:</p>
      <ul>
        <li>
          <strong>Account and profile data</strong> — After your relationship with the institution ends as defined, and
          where no legal retention applies, the institution may delete or deactivate the account according to its process.
        </li>
        <li>
          <strong>Attendance or academic records</strong> — May need to be retained for periods set by law,
          institutional regulations, or educational evidence requirements. Deletion may be partial, anonymized, or
          performed only after the retention period expires.
        </li>
        <li>
          <strong>Technical logs</strong> — May be deleted or anonymized when no longer needed for security or
          investigation.
        </li>
        <li>
          <strong>Location or classroom presence verification data</strong> — If classroom presence verification features
          are enabled, such data may be deleted, anonymized, or retained as necessary to verify attendance accuracy and
          prevent misuse.
        </li>
        <li>
          <strong>Analytics and performance data</strong> — May be deleted or anonymized when no longer needed for system
          improvement, troubleshooting, or Service security.
        </li>
      </ul>

      <h2>3. How to request deletion or account closure</h2>
      <p>You may follow channels your institution provides or the channels shown on the Service website/application, which may include:</p>
      <ul>
        <li>
          <strong>Contact your IT team or system administrator</strong> — State your request and verify your identity
          (e.g., student/staff ID, institutional email) before processing.
        </li>
        <li>
          <strong>In-app or web workflow (if enabled)</strong> — If a dedicated account deletion option exists, follow the
          on-screen steps and any attached instructions.
        </li>
        <li>
          <strong>Written request</strong> — Some institutions require email or a specific form.
        </li>
        <li>
          <strong>Data deletion page</strong> — You may review the initial instructions at /en/data-deletion and follow the
          channel provided by your institution or system administrator.
        </li>
      </ul>
      <p>
        For security, we may ask for additional information to confirm that the requester owns the account or is
        authorized by the institution before deleting, deactivating, or restricting processing of data.
      </p>

      <h2>4. Processing timeline</h2>
      <p>
        After receiving a complete request and verifying identity, administrators will review and process the request
        within a reasonable period, typically within 30 days from receipt of a complete request. Timing may vary depending
        on complexity, system load, data category, or internal institutional policies. If the request cannot be fully
        fulfilled, we will explain why and describe what can be done.
      </p>

      <h2>5. Effect of account deletion</h2>
      <p>
        After deletion or deactivation, you may no longer be able to sign in, use features that require an account, or
        access certain usage history. Some information may remain in a limited or anonymized form where retention is
        required by law, institutional rules, or system security needs. Backup and audit systems may take additional time
        to reflect deletion everywhere.
      </p>

      <h2>6. Exceptions</h2>
      <p>
        We or your institution may refuse, delay, or limit part of a request when necessary, for example where a complaint,
        audit, or investigation is ongoing, legal or institutional obligations require retention, the data is necessary to
        establish or defend rights, or deletion may affect the rights or safety of other users or individuals.
      </p>

      <h2>7. Contact</h2>
      <p>
        To request deletion, close an account, restrict processing, or check the status of a request, contact your
        institution&apos;s administrator or designated privacy coordinator. If your institution has not provided a specific
        channel, you may contact ARCHD Attendance through the contact information shown on the Service website or
        application. You can also read the &quot;Privacy policy&quot; on this site for more detail.
      </p>
    </>
  );
}
